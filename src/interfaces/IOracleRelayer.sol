// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.24;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface IOracleRelayer {
    // Events
    event MessageSent(
        bytes32 indexed messageId,
        uint64 indexed destinationChainSelector,
        bytes receiver,
        bytes text,
        address token,
        uint256 amount,
        address feeToken,
        uint256 fees
    );

    event MessageReceived(
        bytes32 indexed messageId,
        uint64 indexed sourceChainSelector,
        bytes sender,
        address token,
        uint256 amount,
        address callee,
        bytes data
    );

    event DestinationRelayerAdded(
        uint256 chainId,
        uint64 chainSelector,
        bytes relayer
    );
    event DestinationRelayerRemoved(
        uint256 chainId,
        uint64 chainSelector,
        bytes relayer
    );

    event SenderAdded(address sender);
    event SenderRemoved(address sender);

    // View functions
    function linkToken() external view returns (IERC20);

    /// @notice chain selector => relayer address >> relayers allowed to interact with this relayer
    function allowedDestinationRelayers(uint64) external returns (bytes memory);

    /// @notice chain id => chain selector
    function chainIdToChainSelector(uint256) external returns (uint64);

    /// @notice instances that are allowed to interact with this relayer
    function allowedSenders(address) external returns (bool);

    function sendMessageWithToken(
        uint64 _destinationChainSelector,
        bytes calldata _message,
        address _token,
        uint256 _amount,
        bool _includeTokens,
        bool _payWithNative
    ) external returns (bytes32 messageId);

    function sendMessage(
        uint64 _destinationChainSelector,
        bytes calldata _message,
        bool _payWithNative
    ) external returns (bytes32 messageId);

    function addDestinationRelayer(
        uint256 _chainId,
        uint64 _chainSelector,
        address _relayer
    ) external;

    function removeDestinationRelayer(uint256 _chainId) external;

    function addSenders(address _sender) external;

    function removeSender(address _sender) external;

    function recoverAsset(address _asset) external;
}
