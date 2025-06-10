// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.24;

/// @title MockAutomationCaller
/// @notice Simulates Chainlink Automation-compatible caller for OracleCoordinator
contract MockAutomationCaller {
    address public coordinator;

    constructor(address _coordinator) {
        coordinator = _coordinator;
    }

    function triggerAutomation(bytes calldata performData) external {
        (bool success, ) = coordinator.call(
            abi.encodeWithSignature("performUpkeep(bytes)", performData)
        );
        require(success, "performUpkeep failed");
    }
}
