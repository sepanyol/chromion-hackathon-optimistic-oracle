// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.24;

import {IOracleRelayer, IERC20} from "./../interfaces/IOracleRelayer.sol";

/// @title MockRelayer
/// @notice Stub for simulating relayer calls in cross-chain testing
contract MockOracleRelayer is IOracleRelayer {
    function linkToken() external pure returns (IERC20) {
        return IERC20(address(0x20));
    }

    function allowlistedDestinationChains(uint64) external pure returns (bool) {
        return true;
    }

    function allowlistedSourceChainAndSender(
        uint64,
        address
    ) external pure returns (bool) {
        return true;
    }

    event event_allowlistDestinationChain();

    function allowlistDestinationChain(uint64, bool) external {
        emit event_allowlistDestinationChain();
    }

    event event_allowlistSourceChainAndSender();

    function allowlistSourceChainAndSender(uint64, address, bool) external {
        emit event_allowlistSourceChainAndSender();
    }

    event event_sendMessageWithToken();

    function sendMessageWithToken(
        uint64,
        address,
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
        address,
        bytes calldata,
        bool
    ) external returns (bytes32 messageId) {
        emit event_sendMessage();
        return messageId;
    }
}
