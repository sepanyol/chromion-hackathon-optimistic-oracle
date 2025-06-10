// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.24;

/// @title MockRelayer
/// @notice Stub for simulating relayer calls in cross-chain testing
contract MockRelayer {
    event ForwardRequest(
        address indexed requester,
        address indexed request,
        bytes payload
    );

    function forwardRequest(
        address requester,
        address request,
        bytes calldata payload
    ) external {
        emit ForwardRequest(requester, request, payload);
    }
}
