// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.24;

import {RequestTypes} from "../types/RequestTypes.sol";
import {IBaseRequestContract} from "../interfaces/IBaseRequestContract.sol";

import {IERC20} from "@openzeppelin/contracts/interfaces/IERC20.sol";
import {AutomationCompatibleInterface} from "@chainlink/contracts/src/v0.8/automation/interfaces/AutomationCompatibleInterface.sol";

/// @title IOracleCoordinator
/// @notice Interface for the OracleCoordinator contract responsible for coordinating oracle answer proposals,
/// challenges, review voting, and request finalization. It integrates with Chainlink Automation for lifecycle handling.
interface IOracleCoordinator is AutomationCompatibleInterface {
    // ============================
    // ========== Enums ===========
    // ============================
    /// @notice Used for flagging the kind or reward type thats given
    enum RewardType {
        Platform,
        Proposer,
        Challenger,
        Reviewer
    }

    // ============================
    // ========= Structs ==========
    // ============================

    /// @notice Represents a review vote submitted during a challenge phase
    struct Review {
        address reviewer; ///< The address of the reviewer
        uint40 timestamp; ///< Time when the review was submitted
        bytes reason; ///< Encoded reason or justification for the vote
        bool supportsChallenge; ///< Whether the vote supports the challenge
    }

    /// @notice Represents a challenge against a proposed answer
    struct Challenge {
        address challenger; ///< The address of the user who challenged the proposal
        uint40 timestamp; ///< Time when the challenge was submitted
        bytes answer; ///< Proposed alternative answer
        bytes reason; ///< Reason for the challenge
        uint256 votesFor; ///< Number of supporting votes
        uint256 votesAgainst; ///< Number of opposing votes
        Review[] reviews; ///< Array of associated reviews
    }

    /// @notice Represents an answer proposal for a request
    struct Proposal {
        address proposer; ///< The address that proposed the answer
        uint40 timestamp; ///< Timestamp of when the proposal was submitted
        bytes answer; ///< Proposed answer payload
        Challenge challenge; ///< Embedded challenge (if any)

        // TODO handle too early proposals
        // Proposer does proposal and commits with bond
        // Challenger can give too early info as alternative answer
        // Reviewer decide whether it's too early or not
        // Too Early winning Rewards:
        // - 10% of proposer bond to plattform
        // - Rest distributed as follows:
        //   - 40% of proposer bond + initial reward go back to requester for compensation
        //   - 40% of proposer bond is given to the challenger
        //   - 20% of proposer bons is given to the reviewer voted for too early challenge
        // bool isTooEarly; 
    }

    /// @notice Statistics for a participant's activity within the protocol
    struct UserStats {
        uint256 proposed; ///< Total number of proposals submitted
        uint256 proposedSuccess; ///< Number of successfully accepted proposals
        uint256 challenged; ///< Number of challenges initiated
        uint256 challengedSuccess; ///< Number of successful challenges
        uint256 reviewed; ///< Number of review votes cast
        uint256 reviewedSuccess; ///< Number of successful review votes
    }

    // ============================
    // ========= Events ===========
    // ============================

    /// @notice Emitted when a new request is registered from non-EVM chain
    event RequestRegistered(address indexed request, bytes requester);

    /// @notice Emitted when an answer is proposed for a request
    event AnswerProposed(
        address indexed request,
        address indexed proposer,
        bytes answer
    );

    /// @notice Emitted when a challenge is submitted to a proposal
    event ChallengeSubmitted(
        address indexed request,
        address indexed challenger,
        bytes answer,
        bytes reason
    );

    /// @notice Emitted when a review is submitted by a reviewer
    event ReviewSubmitted(
        address indexed request,
        address indexed reviewer,
        bytes reason,
        bool supportsChallenge
    );

    /// @notice Emitted when a request is resolved/finalized
    event RequestResolved(
        address indexed request,
        RequestTypes.RequestStatus outcome
    );

    /// @notice Emitted when a reward is distributed to a participant
    event RewardDistributed(
        address indexed request,
        address indexed recipient,
        uint256 amount,
        RewardType rewardType
    );

    /// @notice Emitted when a bond is refunded to a participant
    event BondRefunded(
        address indexed request,
        address indexed recipient,
        uint256 amount
    );

    // =================================
    // ========= Core Actions ==========
    // =================================

    /// @notice Registers a new request created on the Oracle Chain.
    /// @dev Requires FACTORY_ROLE. Transfers reward amount to this contract and updates internal mappings.
    /// @param _request The address of the request contract to register.
    function registerRequest(address _request) external;

    /// @notice Proposes an answer to an open request.
    /// @dev Requires bond payment in USDC. Stores proposer metadata and answer content.
    /// @param _request The request to answer.
    /// @param _answer The raw answer data.
    function proposeAnswer(address _request, bytes calldata _answer) external;

    /// @notice Challenges a proposed answer with a reason.
    /// @dev Only allowed if the request is in Proposed status. Challenger must not be the original requester.
    /// @param _request The request being challenged.
    /// @param _answer The answer being disputed.
    /// @param _reason A justification string or hash indicating why the answer is incorrect.
    function challengeAnswer(
        address _request,
        bool _proposalTooEarly,
        bytes calldata _answer,
        bytes calldata _reason
    ) external;

    /// @notice Submits a review vote for a challenged request
    /// @param _request The address of the request
    /// @param _reason Justification for the vote (encoded)
    /// @param _supportsChallenge Whether the vote supports the challenge or not
    function submitReview(
        address _request,
        bytes calldata _reason,
        bool _supportsChallenge
    ) external;

    /// @notice Finalizes a request after review/challenge period expires and distributes rewards
    /// @param _request The address of the request to finalize
    function finalizeRequest(address _request) external;

    /// @notice Claims a reviewer reward if the vote was successful
    /// @param _request The address of the request being claimed from
    function claimReward(address _request) external;

    // ===================================
    // ========= View Functions ==========
    // ===================================

    /// @dev Role allowed to finalize requests
    function FINALIZER_ROLE() external view returns (bytes32);

    /// @dev Role allowed to register new requests
    function FACTORY_ROLE() external view returns (bytes32);

    /// @dev Duration in seconds for which a review phase is open
    function REVIEW_WINDOW() external view returns (uint256);

    /// @dev Bond amount in USDC required to submit a proposal
    function PROPOSER_BOND() external view returns (uint256);

    /// @dev Bond amount in USDC required to challenge a proposal
    function CHALLENGER_BOND() external view returns (uint256);

    /// @dev Bond amount in USDC required for a reviewer to submit a review
    function REVIEWER_BOND() external view returns (uint256);

    /// @notice ERC20 token used for bonds and rewards (e.g., USDC)
    function usdc() external view returns (IERC20);

    /// @notice Challenge outcome a specific proposel (computed bytes32)
    function proposalChallengeOutcome(bytes32) external view returns (bool);

    /// Returns the computed outcome id for a challenged proposal of a given request
    /// @param _request address of the request
    function outcomeIdFor(address _request) external pure returns (bytes32 _id);

    /// Returns the computed outcome id against a challenged proposal of a given request
    /// @param _request address of the request
    function outcomeIdAgainst(
        address _request
    ) external pure returns (bytes32 _id);

    /// Returns the computed reviewer vote for a challenged proposal of a given request
    /// @param _request address of the request
    /// @param _reviewer address of the reviewer
    function reviewerVoteIdFor(
        address _request,
        address _reviewer
    ) external pure returns (bytes32 _id);

    /// Returns the computed reviewer vote against a challenged proposal of a given request
    /// @param _request address of the request
    /// @param _reviewer address of the reviewer
    function reviewerVoteIdAgainst(
        address _request,
        address _reviewer
    ) external pure returns (bytes32 _id);

    /// Returns a list of protocols based on the service provider address
    /// @param _limit amount of requests
    /// @param _offset index to start from until limit
    /// @return _requests list of requests
    /// @return _totalCount total amount of requests
    function getRequests(
        uint256 _limit,
        uint256 _offset
    ) external view returns (address[] memory _requests, uint256 _totalCount);

    /// @notice Returns the full proposal information for a given request
    /// @param _request The address of the request
    /// @return Proposal struct with proposer, answer, timestamp, and optional challenge
    function getProposal(
        address _request
    ) external view returns (Proposal memory);

    /// @notice Returns the challenge data for a given request
    /// @param _request The address of the request
    /// @return Challenge struct with challenger data and reviews
    function getChallenge(
        address _request
    ) external view returns (Challenge memory);

    /// @notice Returns all review votes submitted for a challenged request
    /// @param _request The address of the request
    /// @return Array of Review structs
    function getReviews(
        address _request
    ) external view returns (Review[] memory);

    /// @notice Returns vote tally for a challenge on a given request
    /// @param _request The address of the request
    /// @return _for Number of votes supporting the challenge
    /// @return _against Number of votes opposing the challenge
    function getReviewTally(
        address _request
    ) external view returns (uint256 _for, uint256 _against);

    /// @notice Returns statistics for a specific user
    /// @param _user The address of the user
    /// @return _userStats UserStats struct with proposal/review metrics
    function getUserStats(
        address _user
    ) external view returns (UserStats memory _userStats);

    /// @notice Checks if a reviewer is eligible to claim a reward for a request
    /// @param _request The address of the request
    /// @param _claimer The address of the reviewer
    /// @return _is True if the reward can be claimed
    function isClaimable(
        address _request,
        address _claimer
    ) external view returns (bool _is);

    /// @notice Checks if a request has been challenged
    /// @param _request The address of the request
    /// @return _is True if the request has an active challenge
    function isChallenged(address _request) external view returns (bool _is);

    /// @notice Returns the most recently added request eligible for finalization
    /// @return __ The address of the pending finalizable request
    function getMostRecentPendingFinalization()
        external
        view
        returns (address __);
}
