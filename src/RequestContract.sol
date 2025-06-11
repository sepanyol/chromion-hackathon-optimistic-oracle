// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.24;

import {BaseRequestContract} from "./BaseRequestContract.sol";

/// @title RequestContract
/// @notice Concrete implementation of a request, based on the abstract BaseRequestContract
contract RequestContract is BaseRequestContract {
    constructor(
        address _factory,
        address _paymentAsset,
        address _trustee,
        bool _isOracleChain
    ) BaseRequestContract(_factory, _paymentAsset, _trustee, _isOracleChain) {}
}
