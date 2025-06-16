// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.24;

import {RequestTypes} from "./../types/RequestTypes.sol";

interface IRequestFactory {
    /// @notice Implementation address used for cloning.
    function implementation() external returns (address);

    /// @notice ERC20 token used for reward payment.
    function paymentAsset() external returns (address);

    /// @notice Address of the oracle coordinator or relayer, depending on the chain.
    function oracleOrRelayer() external returns (address);

    /// @notice Address of the factory on the home chain
    function homeFactory() external returns (address);

    /// @notice Flag indicating whether this factory is deployed on the OracleChain.
    function isOracleChain() external returns (bool);

    /// @notice Creates a new request contract with the provided parameters.
    /// @dev Clones a minimal proxy of the request implementation and initializes it.
    ///      Transfers the reward amount from the sender to the factory.
    /// @param p The struct containing all request parameters.
    /// @return clone The address of the newly deployed request contract.
    function createRequest(
        RequestTypes.RequestParams memory p
    ) external returns (address);
}
