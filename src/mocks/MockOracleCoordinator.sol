// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IOracleCoordinator} from "../interfaces/IOracleCoordinator.sol";

contract MockOracleCoordinator is IOracleCoordinator {
    event registerRequestEmit();

    function registerRequest(address) external {
        emit registerRequestEmit();
    }

    function proposeAnswer(address _request, bytes calldata _answer) external {}

    function challengeAnswer(
        address _request,
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

    function getProposal(
        address _request
    ) external view returns (Proposal memory) {}

    function getChallenge(
        address _request
    ) external view returns (Challenge memory) {}

    function getReviews(
        address _request
    ) external view returns (Review[] memory) {}

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
}
