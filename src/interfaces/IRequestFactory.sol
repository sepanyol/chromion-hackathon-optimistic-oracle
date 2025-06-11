// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.24;

import {RequestTypes} from "./../types/RequestTypes.sol";

interface IRequestFactory {
    function implementation() external returns (address);

    function paymentAsset() external returns (address);

    function oracleOrRelayer() external returns (address);

    function isOracleChain() external returns (bool);

    function createRequest(
        RequestTypes.RequestParams memory p
    ) external returns (address);
}
