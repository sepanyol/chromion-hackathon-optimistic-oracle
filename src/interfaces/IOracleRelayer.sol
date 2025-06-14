// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.24;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface IOracleRelayer {
    // Events
    event MessageSent(
        bytes32 indexed messageId,
        uint64 indexed destinationChainSelector,
        address receiver,
        bytes text,
        address token,
        uint256 amount,
        address feeToken,
        uint256 fees
    );

    event MessageReceived(
        bytes32 indexed messageId,
        uint64 indexed sourceChainSelector,
        address sender,
        address token,
        uint256 amount,
        address callee,
        bytes data
    );

    // View functions
    function linkToken() external view returns (IERC20);

    function allowlistedDestinationChains(
        uint64 chainSelector
    ) external view returns (bool);

    function allowlistedSourceChainAndSender(
        uint64 chainSelector,
        address sender
    ) external view returns (bool);

    // State-changing functions
    function allowlistDestinationChain(
        uint64 _destinationChainSelector,
        bool _allowed
    ) external;

    function allowlistSourceChainAndSender(
        uint64 _sourceChainSelector,
        address _sender,
        bool _allowed
    ) external;

    function sendMessageWithToken(
        uint64 _destinationChainSelector,
        address _receiver,
        bytes calldata _text,
        address _token,
        uint256 _amount,
        bool _includeTokens,
        bool _payWithNative
    ) external returns (bytes32 messageId);

    function sendMessage(
        uint64 _destinationChainSelector,
        address _receiver,
        bytes calldata _text,
        bool _payWithNative
    ) external returns (bytes32 messageId);
}
