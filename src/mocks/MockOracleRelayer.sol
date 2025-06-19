// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.24;

import {IOracleRelayer, IERC20} from "./../interfaces/IOracleRelayer.sol";

/// @title MockRelayer
/// @notice Stub for simulating relayer calls in cross-chain testing
contract MockOracleRelayer is IOracleRelayer {
    function linkToken() external pure returns (IERC20) {
        return IERC20(address(0x20));
    }

    function allowedDestinationRelayers(
        uint64
    ) external returns (bytes memory) {}

    function chainIdToChainSelector(uint256) external returns (uint64) {}

    /// @notice instances that are allowed to interact with this relayer
    function allowedSenders(address) external returns (bool) {}

    function addDestinationRelayer(
        uint256 _chainId,
        uint64 _chainSelector,
        address _relayer
    ) external {}

    function removeDestinationRelayer(uint256 _chainId) external {}

    function addSenders(address _sender) external {}

    function removeSender(address _sender) external {}

    function recoverAsset(address _asset) external {}

    event event_sendMessageWithToken();

    function sendMessageWithToken(
        uint64,
        bytes calldata,
        address,
        uint256,
        bool,
        bool
    ) external returns (bytes32 messageId) {
        emit event_sendMessageWithToken();
        return messageId;
    }

    event event_sendMessage();

    function sendMessage(
        uint64,
        bytes calldata,
        bool
    ) external returns (bytes32 messageId) {
        emit event_sendMessage();
        return messageId;
    }
}
