// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.24;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {EnumerableSet} from "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

import {IOracleRelayer} from "./interfaces/IOracleRelayer.sol";
import {IOracleCoordinator} from "./interfaces/IOracleCoordinator.sol";
import {IBaseRequestContract} from "./interfaces/IBaseRequestContract.sol";

import {RequestTypes} from "./types/RequestTypes.sol";
import {console} from "forge-std/console.sol";

/// @title OracleCoordinator
/// @notice Manages answer proposals, challenges, review voting, and resolution of requests.
contract OracleCoordinator is
    IOracleCoordinator,
    AccessControl,
    ReentrancyGuard
{
    using EnumerableSet for EnumerableSet.AddressSet;
    using RequestTypes for RequestTypes.RequestStatus;

    // === Constants ===

    /// @dev Role allowed to finalize requests
    bytes32 public constant FINALIZER_ROLE = keccak256("FINALIZER_ROLE");

    /// @dev Role allowed to register new requests
    bytes32 public constant FACTORY_ROLE = keccak256("FACTORY_ROLE");

    /// @dev Duration in seconds for which a review phase is open
    uint256 public constant REVIEW_WINDOW = 1 days;

    /// @dev Bond amount in USDC required to submit a proposal
    uint256 public constant PROPOSER_BOND = 100e6;

    /// @dev Bond amount in USDC required to challenge a proposal
    uint256 public constant CHALLENGER_BOND = 100e6;

    /// @dev Bond amount in USDC required for a reviewer to submit a review
    uint256 public constant REVIEWER_BOND = 5e6;

    // === State ===

    /// @notice ERC20 token used for bonds and rewards (e.g., USDC)
    IERC20 public immutable usdc;

    /// @notice Oracle Relayer to communicate cross chain
    IOracleRelayer public immutable relayer;

    /// @notice Address of the platform treasury or DAO
    address public platform;

    /// @dev Maps a request address to its contract interface
    mapping(address => IBaseRequestContract) private requestStore;

    /// @dev Maps a request address to its proposal state
    mapping(address => Proposal) private proposalStore;

    /// @dev Maps user stats tp a specific user address
    mapping(address => UserStats) private userStats;

    /// @dev Maps outcome keys to true if the outcome succeeded
    mapping(bytes32 => bool) private proposalChallengeOutcome;

    /// @dev Maps a request to the claimable reward amount for reviewers
    mapping(address => uint256) public reviewerClaimAmount;

    /// @dev Tracks which vote (for/against) a reviewer submitted
    mapping(bytes32 => bool) private reviewerVote;

    /// @dev Tracks if a reviewer has claimed their reward for a specific request
    mapping(address => mapping(address => bool)) private reviewerRewarded;

    /// @dev Set of registered request addresses
    EnumerableSet.AddressSet private requests;

    /// @dev Set of requests pending finalization
    EnumerableSet.AddressSet private nonFinalizedRequests;

    /// @dev Ensures the given request is known
    modifier validRequest(address _request) {
        require(requests.contains(_request), "Invalid request");
        _;
    }

    /// @notice Deploys the coordinator contract
    /// @param _platform Address of the platform treasury or admin
    /// @param _usdc ERC20 token used for all bond and reward transfers
    constructor(
        address _platform, // multi sig
        address _relayer, // oracle relayer
        address _usdc
    ) {
        require(_platform != address(0), "invalid address");
        require(_usdc != address(0), "invalid address");
        platform = _platform;
        usdc = IERC20(_usdc);
        relayer = IOracleRelayer(_relayer);
        _grantRole(DEFAULT_ADMIN_ROLE, _platform);
    }

    /// ===== Core Functions =====

    /// @inheritdoc IOracleCoordinator
    function registerRequest(address _request) external onlyRole(FACTORY_ROLE) {
        require(_request != address(0), "Invalid address");
        require(!requests.contains(_request), "Request already exists");
        requestStore[_request] = IBaseRequestContract(_request);
        requests.add(_request);
        nonFinalizedRequests.add(_request);

        // transfer reward amount to oracle
        require(
            usdc.transferFrom(
                msg.sender,
                address(this),
                requestStore[_request].rewardAmount()
            ),
            "Funding failed"
        );

        _updateRequestStatus(_request, RequestTypes.RequestStatus.Open);

        emit RequestRegistered(_request, requestStore[_request].requester());
    }

    /// @inheritdoc IOracleCoordinator
    function proposeAnswer(
        address _request,
        bytes calldata answer
    ) external validRequest(_request) nonReentrant {
        require(
            requestStore[_request].status() == RequestTypes.RequestStatus.Open,
            "Already proposed"
        );

        _updateRequestStatus(_request, RequestTypes.RequestStatus.Proposed);

        proposalStore[_request].proposer = msg.sender;
        proposalStore[_request].answer = answer;
        proposalStore[_request].timestamp = uint40(block.timestamp);

        require(
            usdc.transferFrom(msg.sender, address(this), PROPOSER_BOND),
            "Bond transfer failed"
        );

        userStats[msg.sender].proposed++;

        emit AnswerProposed(_request, msg.sender, answer);
    }

    /// @inheritdoc IOracleCoordinator
    function challengeAnswer(
        address _request,
        bytes calldata answer,
        bytes calldata reason
    ) external validRequest(_request) nonReentrant {
        require(
            requestStore[_request].status() ==
                RequestTypes.RequestStatus.Proposed,
            "Not proposed"
        );

        require(
            keccak256(requestStore[_request].requester()) !=
                keccak256(abi.encode(msg.sender)),
            "Challenger not allowed"
        );

        Challenge storage _challenge = proposalStore[_request].challenge;
        _challenge.challenger = msg.sender;
        _challenge.timestamp = uint40(block.timestamp);
        _challenge.answer = answer;
        _challenge.reason = reason;

        _updateRequestStatus(_request, RequestTypes.RequestStatus.Challenged);

        userStats[msg.sender].challenged++;

        require(
            usdc.transferFrom(msg.sender, address(this), CHALLENGER_BOND),
            "Challenge bond failed"
        );

        emit ChallengeSubmitted(_request, msg.sender, answer, reason);
    }

    /// @inheritdoc IOracleCoordinator
    function submitReview(
        address _request,
        bytes calldata reason,
        bool supportsChallenge
    ) external validRequest(_request) nonReentrant {
        require(
            requestStore[_request].status() ==
                RequestTypes.RequestStatus.Challenged,
            "Not challenged"
        );

        require(
            proposalStore[_request].proposer != msg.sender,
            "Reviewer is proposer"
        );

        require(
            keccak256(requestStore[_request].requester()) !=
                keccak256(abi.encode(msg.sender)),
            "Reviewer is requester"
        );

        require(
            !reviewerVote[_reviewerVoteIdFor(_request, msg.sender)] &&
                !reviewerVote[_reviewerVoteIdAgainst(_request, msg.sender)],
            "Already reviewed"
        );

        reviewerVote[
            supportsChallenge
                ? _reviewerVoteIdFor(_request, msg.sender)
                : _reviewerVoteIdAgainst(_request, msg.sender)
        ] = true;

        Challenge storage _challenge = proposalStore[_request].challenge;

        require(_challenge.challenger != msg.sender, "Reviewer is challenger");

        _challenge.reviews.push(
            Review({
                reviewer: msg.sender,
                reason: reason,
                timestamp: uint40(block.timestamp),
                supportsChallenge: supportsChallenge
            })
        );

        if (supportsChallenge) _challenge.votesFor++;
        else _challenge.votesAgainst++;

        userStats[msg.sender].reviewed++;

        require(
            usdc.transferFrom(msg.sender, address(this), REVIEWER_BOND),
            "Review bond failed"
        );

        emit ReviewSubmitted(_request, msg.sender, reason, supportsChallenge);
    }

    /// @inheritdoc IOracleCoordinator
    function finalizeRequest(
        address _request
    ) public validRequest(_request) nonReentrant onlyRole(FINALIZER_ROLE) {
        (
            bool _canBeFinalized,
            RequestTypes.RequestStatus _status
        ) = _isFinalizable(_request);

        require(
            _status != RequestTypes.RequestStatus.Resolved,
            "Already finalized"
        );

        require(_canBeFinalized, "Not finalizable");

        Proposal storage _proposal = proposalStore[_request];
        Challenge storage _challenge = _proposal.challenge;

        // set temporary optimistic status
        _status = RequestTypes.RequestStatus.Resolved;

        uint96 _rewardAmount = requestStore[_request].rewardAmount();
        uint256 _platformShare = 0;

        // not challenged
        if (!isChallenged(_request)) {
            _updateRequestAnswer(_request, _proposal.answer);

            uint256 _proposerShare = (_rewardAmount * 9) / 10; // 90%
            _platformShare = _rewardAmount - _proposerShare; // ~10%

            // bump proposer success rate
            userStats[_proposal.proposer].proposedSuccess++;

            emit BondRefunded(_request, _proposal.proposer, PROPOSER_BOND);
            emit RewardDistributed(
                _request,
                _proposal.proposer,
                _proposerShare
            );

            require(
                usdc.transfer(
                    _proposal.proposer,
                    _proposerShare + PROPOSER_BOND
                ),
                "Fail proposer transfer"
            );
        } else {
            // challenge succeeded (supporters > opposers)
            // proposer bond + reward (-> 80% challenger, -> 10% reviewer, -> 10% platform)
            if (_challenge.votesFor > _challenge.votesAgainst) {
                _updateRequestAnswer(_request, _challenge.answer);
                proposalChallengeOutcome[_outcomeIdFor(_request)] = true;

                // base rewards
                uint256 _amount = _rewardAmount + PROPOSER_BOND; // requester reward + proposer bond
                uint256 _challengerShare = (_amount * 8) / 10; // 80%
                uint256 _reviewersShare = (_amount * 1) / 10; // 10% + against bonds
                _platformShare = _amount - _challengerShare - _reviewersShare; // ~10%

                // add review loser bonds
                _reviewersShare += (REVIEWER_BOND * _challenge.votesAgainst);

                // add dust of reviewer share to platform
                _platformShare += _reviewersShare % _challenge.votesFor;

                // amount for each reviewer to claim + own bond
                reviewerClaimAmount[_request] =
                    (_reviewersShare / _challenge.votesFor) +
                    REVIEWER_BOND;

                // bump challenger success rate
                userStats[_challenge.challenger].challengedSuccess++;

                emit RewardDistributed(
                    _request,
                    _challenge.challenger,
                    _challengerShare
                );

                require(
                    usdc.transfer(
                        _challenge.challenger,
                        _challengerShare + CHALLENGER_BOND
                    ),
                    "Fail challenger transfer"
                );
            } else {
                _updateRequestAnswer(_request, _proposal.answer);
                proposalChallengeOutcome[_outcomeIdAgainst(_request)] = true;

                uint256 _proposerShare = (_rewardAmount * 9) / 10; // only 90%, cause of being challenge

                // reviewer rewards
                uint256 _reviewersAmount = CHALLENGER_BOND +
                    (REVIEWER_BOND * _challenge.votesFor);

                uint256 _reviewersShare = (_reviewersAmount * 9) / 10; // 90%

                _platformShare =
                    (_rewardAmount - _proposerShare) + // ~10% from reward for platform
                    (_reviewersAmount -
                        _reviewersShare +
                        (_reviewersShare % _challenge.votesAgainst)); // ~10% from reviewers for platform + dust

                reviewerClaimAmount[_request] =
                    (_reviewersShare / _challenge.votesAgainst) +
                    REVIEWER_BOND;

                emit BondRefunded(_request, _proposal.proposer, PROPOSER_BOND);
                emit RewardDistributed(
                    _request,
                    _proposal.proposer,
                    _proposerShare
                );

                // reward is transfered to proposer
                require(
                    usdc.transfer(
                        _proposal.proposer,
                        _proposerShare + PROPOSER_BOND
                    ),
                    "Fail proposer transfer"
                );
            }
        }

        if (_platformShare > 0) {
            emit RewardDistributed(_request, platform, _platformShare);

            require(
                usdc.transfer(platform, _platformShare),
                "Fail platform transfer"
            );
        }

        // remove from non finalized requests
        nonFinalizedRequests.remove(_request);

        emit RequestResolved(_request, RequestTypes.RequestStatus.Resolved);
    }

    /// @inheritdoc IOracleCoordinator
    function claimReward(address _request) external nonReentrant {
        require(_isClaimable(_request, msg.sender), "Not allowed to claim");

        reviewerRewarded[_request][msg.sender] = true;

        userStats[msg.sender].reviewedSuccess++;

        require(
            usdc.transfer(msg.sender, reviewerClaimAmount[_request]),
            "Fail reviewer transfer"
        );

        emit RewardDistributed(
            _request,
            msg.sender,
            reviewerClaimAmount[_request]
        );
    }

    /// @inheritdoc IOracleCoordinator
    function getRequests(
        uint256 _limit,
        uint256 _offset
    ) external view returns (address[] memory _requests, uint256 _totalCount) {
        _totalCount = requests.length();
        _limit = _maxLimit(_limit, _offset, _totalCount);
        _requests = new address[](_limit);
        for (uint256 _start = 0; _start + _offset < _limit + _offset; _start++)
            _requests[_start] = requests.at(_start + _offset);
    }

    /// Helper function to figure out the max limit of a list
    /// @param limit limit that has been targeted
    /// @param offset offset that has been targeted
    /// @param count the amount of entries the calculation should be based on
    /// @dev is used to not overflow the possible available limits of a list
    function _maxLimit(
        uint256 limit,
        uint256 offset,
        uint256 count
    ) internal pure returns (uint256) {
        if (limit + offset > count && offset < count) return count - offset;
        else if (limit + offset <= count) return limit;
        else return 0;
    }

    /// @inheritdoc IOracleCoordinator
    function getProposal(
        address _request
    ) external view returns (Proposal memory _proposal) {
        _proposal = proposalStore[_request];
    }

    /// @inheritdoc IOracleCoordinator
    function getChallenge(
        address _request
    ) external view returns (Challenge memory _challenge) {
        _challenge = proposalStore[_request].challenge;
    }

    /// @inheritdoc IOracleCoordinator
    function getReviews(
        address _request
    ) external view returns (Review[] memory _reviews) {
        _reviews = proposalStore[_request].challenge.reviews;
    }

    /// @inheritdoc IOracleCoordinator
    function getReviewTally(
        address _request
    ) external view returns (uint256 _for, uint256 _against) {
        _for = proposalStore[_request].challenge.votesFor;
        _against = proposalStore[_request].challenge.votesAgainst;
    }

    /// @inheritdoc IOracleCoordinator
    function getUserStats(
        address _user
    ) external view returns (UserStats memory _userStats) {
        _userStats = userStats[_user];
    }

    /// @inheritdoc IOracleCoordinator
    function isClaimable(
        address _request,
        address _claimer
    ) external view returns (bool _is) {
        _is = _isClaimable(_request, _claimer);
    }

    /// @dev Internal view function to determine if a user can claim a reward for a given request
    function _isClaimable(
        address _request,
        address _claimer
    ) internal view returns (bool _is) {
        bool _successFor = proposalChallengeOutcome[_outcomeIdFor(_request)] &&
            reviewerVote[_reviewerVoteIdFor(_request, _claimer)];

        bool _successAgainst = proposalChallengeOutcome[
            _outcomeIdFor(_request)
        ] && reviewerVote[_reviewerVoteIdFor(_request, _claimer)];

        bool _success = _successFor || _successAgainst;

        _is =
            reviewerClaimAmount[_request] > 0 &&
            _success &&
            !reviewerRewarded[_request][_claimer];
    }

    /// @inheritdoc IOracleCoordinator
    function isChallenged(address _request) public view returns (bool _is) {
        _is = proposalStore[_request].challenge.timestamp != 0;
    }

    /// @inheritdoc IOracleCoordinator
    function getMostRecentPendingFinalization() public view returns (address) {
        uint256 _totalLength = nonFinalizedRequests.length();
        for (uint256 i; i < _totalLength; i++) {
            address _finalizableAddress = nonFinalizedRequests.at(i);
            (bool _is, ) = _isFinalizable(_finalizableAddress);
            if (_is) return _finalizableAddress;
        }
        return address(0);
    }

    /// @dev Returns whether a request is eligible for finalization and its current status
    function _isFinalizable(
        address _request
    ) internal view returns (bool _is, RequestTypes.RequestStatus _status) {
        _status = requestStore[_request].status();

        Proposal storage _proposal = proposalStore[_request];

        if (
            _status == RequestTypes.RequestStatus.Proposed && // is proposed
            block.timestamp - requestStore[_request].createdAt() >
            requestStore[_request].challengeWindow() // and elapsed time is > challenge window
        ) return (true, _status);

        if (
            _status == RequestTypes.RequestStatus.Challenged && // is challenged
            block.timestamp - _proposal.timestamp > REVIEW_WINDOW // and elapsed time is > review window
        ) return (true, _status);

        return (false, _status);
    }

    /// @dev Internal helper to compute outcome identifier for supporting votes
    function _outcomeIdFor(
        address _request
    ) internal pure returns (bytes32 _id) {
        _id = keccak256(abi.encodePacked(_request, "-", "FOR"));
    }

    /// @dev Internal helper to compute outcome identifier for opposing votes
    function _outcomeIdAgainst(
        address _request
    ) internal pure returns (bytes32 _id) {
        _id = keccak256(abi.encodePacked(_request, "-", "AGAINST"));
    }

    /// @dev Internal helper to compute a reviewer's support vote ID
    function _reviewerVoteIdFor(
        address _request,
        address _reviewer
    ) internal pure returns (bytes32 _id) {
        _id = keccak256(abi.encodePacked(_request, "-", _reviewer, "-", "FOR"));
    }

    /// @dev Internal helper to compute a reviewer's oppose vote ID
    function _reviewerVoteIdAgainst(
        address _request,
        address _reviewer
    ) internal pure returns (bytes32 _id) {
        _id = keccak256(
            abi.encodePacked(_request, "-", _reviewer, "-", "AGAINST")
        );
    }

    function _updateRequestStatus(
        address _request,
        RequestTypes.RequestStatus _status
    ) internal {
        bytes memory _originAddress = requestStore[_request].originAddress();
        if (keccak256(_originAddress) != keccak256(abi.encode(address(0)))) {
            bytes memory _message = abi.encode(
                _originAddress,
                abi.encodeWithSelector(
                    IBaseRequestContract.updateStatus.selector,
                    _status
                )
            );
            // TODO how does this look like for SOLANA?
            relayer.sendMessage(
                relayer.chainIdToChainSelector(
                    abi.decode(
                        requestStore[_request].originChainId(),
                        (uint256)
                    )
                ),
                _message,
                false
            );
        }
        requestStore[_request].updateStatus(_status);
    }

    function _updateRequestAnswer(
        address _request,
        bytes memory _answer
    ) internal {
        bytes memory _originAddress = requestStore[_request].originAddress();
        if (keccak256(_originAddress) != keccak256(abi.encode(address(0)))) {
            bytes memory _message = abi.encode(
                _originAddress,
                abi.encodeWithSelector(
                    IBaseRequestContract.updateAnswer.selector,
                    _answer
                )
            );
            // TODO how does this look like for SOLANA?
            relayer.sendMessage(
                relayer.chainIdToChainSelector(
                    abi.decode(
                        requestStore[_request].originChainId(),
                        (uint256)
                    )
                ),
                _message,
                false
            );
        }
        requestStore[_request].updateAnswer(_answer);
    }

    /// @notice Chainlink Automation check if upkeep is needed
    function checkUpkeep(
        bytes calldata
    ) external view returns (bool upkeepNeeded, bytes memory performData) {
        address _address = getMostRecentPendingFinalization();
        if (_address != address(0)) {
            upkeepNeeded = true;
            performData = abi.encode(_address);
        }
    }

    /// @notice Chainlink Automation perform function for upkeep execution
    function performUpkeep(bytes calldata performData) external {
        address requestToFinalize = abi.decode(performData, (address));
        finalizeRequest(requestToFinalize);
    }
}
