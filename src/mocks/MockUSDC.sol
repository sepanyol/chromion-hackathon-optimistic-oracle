// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/// @title MockUSDC
/// @notice Simple ERC20 token used for testing USDC transfers
contract MockUSDC is ERC20 {
    constructor() ERC20("Mock USD Coin", "mUSDC") {
        _mint(msg.sender, 1_000_000e6);
    }

    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }

    function decimals() public pure override returns (uint8) {
        return 6;
    }

    bool failOnTransfer = false;

    function setFailOnTransfer(bool _failOnTransfer) external {
        failOnTransfer = _failOnTransfer;
    }

    function transferFrom(
        address from,
        address to,
        uint256 value
    ) public virtual override returns (bool) {
        return failOnTransfer ? false : super.transferFrom(from, to, value);
    }

    function transfer(
        address to,
        uint256 amount
    ) public virtual override returns (bool) {
        return failOnTransfer ? false : super.transfer(to, amount);
    }
}
