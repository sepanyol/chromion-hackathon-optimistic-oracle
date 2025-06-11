// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {RequestTypes} from "../types/RequestTypes.sol";
import {IBaseRequestContract} from "../interfaces/IBaseRequestContract.sol";

/// @title MockBaseRequestContract
/// @notice Mock implementation of IBaseRequestContract for testing OracleCoordinator
contract MockBaseRequestContract is IBaseRequestContract {
    using RequestTypes for RequestTypes.RequestStatus;

    bytes public requester;
    uint96 public reward;
    RequestTypes.RequestStatus public override status;
    uint40 public created;
    uint40 public challengeWindowLength;
    bytes public answer;

    bytes public originAddress;
    bytes public originChainId;

    string public questionText;
    string public contextText;
    string public truthText;

    constructor(
        bytes memory _requester,
        uint96 _reward,
        uint40 _challengeWindowLength,
        string memory _question,
        string memory _context,
        string memory _truthMeaning
    ) {
        requester = bytes(_requester);
        reward = _reward;
        created = uint40(block.timestamp);
        challengeWindowLength = _challengeWindowLength;
        questionText = _question;
        contextText = _context;
        truthText = _truthMeaning;
        status = RequestTypes.RequestStatus.Open;

        // emit this event, when evm chain has created the request
        // emit RequestInitialized(abi.decode(_requester, (address)));
        // chain selector 16423721717087811551
        // TODO implement regocnition of solana from relayers
        emit RequestInitialized(_requester);
    }

    function rewardAmount() external view override returns (uint96) {
        return reward;
    }

    function challengeWindow() external view override returns (uint40) {
        return challengeWindowLength;
    }

    function updateStatus(
        RequestTypes.RequestStatus newStatus
    ) external override {
        status = newStatus;
        emit RequestStatusUpdated(newStatus);
    }

    function updateAnswer(bytes calldata _answer) external override {
        answer = _answer;
        status = RequestTypes.RequestStatus.Resolved;
    }

    function createdAt() external view override returns (uint40) {
        return created;
    }

    function question() external view override returns (string memory) {
        return questionText;
    }

    function context() external view override returns (string memory) {
        return contextText;
    }

    function truthMeaning() external view override returns (string memory) {
        return truthText;
    }

    function getFullPrompt() external pure returns (string memory) {
        return "full-prompt";
    }
}
