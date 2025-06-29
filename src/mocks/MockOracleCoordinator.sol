// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IOracleCoordinator, IERC20} from "../interfaces/IOracleCoordinator.sol";

contract MockOracleCoordinator is IOracleCoordinator {
    event registerRequestEmit();

    function registerRequest(address) external {
        emit registerRequestEmit();
    }

    function proposeAnswer(address _request, bytes calldata _answer) external {}

    function challengeAnswer(
        address _request,
        bool _proposalTooEarly,
        bytes calldata _answer,
        bytes calldata _reason
    ) external {}

    function submitReview(
        address _request,
        bytes calldata _reason,
        bool _supportsChallenge
    ) external {}

    function finalizeRequest(address _request) external {}

    function claimReward(address _request) external {}

    function getRequests(
        uint256 _limit,
        uint256 _offset
    ) external view returns (address[] memory _requests, uint256 _totalCount) {}

    function getProposal(
        address _request
    ) external view returns (Proposal memory) {}

    function getChallenge(
        address _request
    ) external view returns (Challenge memory) {}

    function getReviews(
        address _request
    ) external view returns (Review[] memory) {}

    function getReviewerVotes(
        address _request,
        address _reviewer
    ) external view returns (Review memory _review) {}

    function getReviewTally(
        address _request
    ) external view returns (uint256 _for, uint256 _against) {}

    function getUserStats(
        address _user
    ) external view returns (UserStats memory _userStats) {}

    function isClaimable(
        address _request,
        address _claimer
    ) external view returns (bool _is) {}

    function isChallenged(address _request) external view returns (bool _is) {}

    function getMostRecentPendingFinalization()
        external
        view
        returns (address __)
    {}

    function checkUpkeep(
        bytes calldata checkData
    ) external returns (bool upkeepNeeded, bytes memory performData) {}

    function performUpkeep(bytes calldata performData) external {}

    function FINALIZER_ROLE() external view returns (bytes32) {}

    function FACTORY_ROLE() external view returns (bytes32) {}

    function REVIEW_WINDOW() external view returns (uint256) {}

    function PROPOSER_BOND() external view returns (uint256) {}

    function CHALLENGER_BOND() external view returns (uint256) {}

    function REVIEWER_BOND() external view returns (uint256) {}

    function usdc() external view returns (IERC20) {}

    function outcomeIdFor(address _request) public pure returns (bytes32 _id) {
        _id = keccak256(abi.encodePacked(_request, "-", "FOR"));
    }

    function outcomeIdAgainst(
        address _request
    ) public pure returns (bytes32 _id) {
        _id = keccak256(abi.encodePacked(_request, "-", "AGAINST"));
    }

    function reviewerVoteIdFor(
        address _request,
        address _reviewer
    ) public pure returns (bytes32 _id) {
        _id = keccak256(abi.encodePacked(_request, "-", _reviewer, "-", "FOR"));
    }

    function reviewerVoteIdAgainst(
        address _request,
        address _reviewer
    ) public pure returns (bytes32 _id) {
        _id = keccak256(
            abi.encodePacked(_request, "-", _reviewer, "-", "AGAINST")
        );
    }

    function proposalChallengeOutcome(bytes32) external view returns (bool) {}
}
