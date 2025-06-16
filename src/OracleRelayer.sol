// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.24;

import {IOracleRelayer} from "./interfaces/IOracleRelayer.sol";
import {IRouterClient} from "@chainlink/contracts-ccip/contracts/interfaces/IRouterClient.sol";
import {CCIPReceiver} from "@chainlink/contracts-ccip/contracts/applications/CCIPReceiver.sol";
import {Client} from "@chainlink/contracts-ccip/contracts/libraries/Client.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {console} from "forge-std/console.sol";

/// @title OracleRelayer
/// @notice Relayer that sends interchain messages from and to whitelisted corresponding relayers
/// @notice Needs to know the corresponding relayers on desired chains based on chain id
contract OracleRelayer is CCIPReceiver, Ownable, IOracleRelayer {
    using SafeERC20 for IERC20;

    // Define roles for access control

    IERC20 public immutable linkToken;

    mapping(uint256 => uint64) public chainIdToChainSelector;

    /// @notice chain selector => relayer address >> relayers allowed to interact with this relayer
    mapping(uint64 => bytes) public allowedDestinationRelayers;

    /// @notice instances that are allowed to interact with this relayer
    mapping(address => bool) public allowedSenders;

    modifier onlyAllowedSender() {
        if (!allowedSenders[msg.sender]) revert("Invalid sender");
        _;
    }

    constructor(
        address _linkToken,
        address _router
    ) CCIPReceiver(_router) Ownable(msg.sender) {
        if (_linkToken == address(0)) revert("Invalid LINK token address");
        if (_router == address(0)) revert("Invalid router address");
        linkToken = IERC20(_linkToken);
    }

    function addDestinationRelayer(
        uint256 _chainId,
        uint64 _chainSelector,
        address _relayer
    ) external onlyOwner {
        if (_relayer == address(0)) revert("Invalid address");
        if (_chainId == 0) revert("Invalid chain id");
        if (_chainSelector == 0) revert("Invalid chain selector");
        chainIdToChainSelector[_chainId] = _chainSelector;
        allowedDestinationRelayers[_chainSelector] = abi.encode(_relayer);
        emit DestinationRelayerAdded(
            _chainId,
            _chainSelector,
            allowedDestinationRelayers[_chainSelector]
        );
    }

    function removeDestinationRelayer(uint256 _chainId) external onlyOwner {
        if (chainIdToChainSelector[_chainId] == 0) revert("Invalid chain id");
        uint64 _selector = chainIdToChainSelector[_chainId];
        bytes memory _relayer = allowedDestinationRelayers[_selector];
        delete chainIdToChainSelector[_chainId];
        delete allowedDestinationRelayers[_selector];
        emit DestinationRelayerRemoved(_chainId, _selector, _relayer);
    }

    function addSenders(address _sender) external onlyOwner {
        if (_sender == address(0)) revert("Invalid address");
        allowedSenders[_sender] = true;
        emit SenderAdded(_sender);
    }

    function removeSender(address _sender) external onlyOwner {
        if (_sender == address(0)) revert("Invalid sender address");
        if (!allowedSenders[_sender]) revert("Invalid sender");
        delete allowedSenders[_sender];
        emit SenderRemoved(_sender);
    }

    function ccipReceive(
        Client.Any2EVMMessage calldata message
    ) external override {
        _ccipReceive(message);
    }

    function sendMessageWithToken(
        uint64 _destinationChainSelector,
        bytes calldata _message,
        address _token,
        uint256 _amount,
        bool _includeTokens,
        bool _payWithNative
    ) external onlyAllowedSender returns (bytes32 messageId) {
        if (
            keccak256(allowedDestinationRelayers[_destinationChainSelector]) ==
            keccak256(abi.encode(address(0)))
        ) revert("Invalid destination chain");

        return
            _sendMessageWithToken(
                _destinationChainSelector,
                allowedDestinationRelayers[_destinationChainSelector],
                _message,
                _token,
                _amount,
                _includeTokens,
                _payWithNative
            );
    }

    function sendMessage(
        uint64 _destinationChainSelector,
        bytes calldata _message,
        bool _payWithNative
    ) external onlyAllowedSender returns (bytes32 messageId) {
        if (
            keccak256(allowedDestinationRelayers[_destinationChainSelector]) ==
            keccak256(abi.encode(address(0)))
        ) revert("Invalid destination chain");

        return
            _sendMessageWithToken(
                _destinationChainSelector,
                allowedDestinationRelayers[_destinationChainSelector],
                _message,
                address(0),
                0,
                false,
                _payWithNative
            );
    }

    receive() external payable {}

    /// internal functions

    function _sendMessageWithToken(
        uint64 _destinationChainSelector,
        bytes memory _receiver,
        bytes calldata _message,
        address _token,
        uint256 _amount,
        bool _includeTokens,
        bool _payWithNative
    ) internal returns (bytes32 messageId) {
        Client.EVMTokenAmount[]
            memory tokenAmounts = new Client.EVMTokenAmount[](0); // no tokens send by default

        if (_includeTokens) {
            if (_token == address(0)) revert("Token address cannot be zero");
            if (_amount == 0) revert("Amount must be greater than zero");
            tokenAmounts = new Client.EVMTokenAmount[](1);
            tokenAmounts[0] = Client.EVMTokenAmount({
                token: _token,
                amount: _amount
            });
            if (
                !IERC20(_token).transferFrom(msg.sender, address(this), _amount)
            ) revert("Token transfer failed");
        }

        Client.EVM2AnyMessage memory message = Client.EVM2AnyMessage({
            receiver: _receiver,
            data: _message,
            tokenAmounts: tokenAmounts,
            extraArgs: Client._argsToBytes(
                Client.GenericExtraArgsV2({
                    gasLimit: 900_000,
                    allowOutOfOrderExecution: false
                })
            ),
            feeToken: _payWithNative ? address(0) : address(linkToken)
        });

        uint256 fees = IRouterClient(CCIPReceiver.getRouter()).getFee(
            _destinationChainSelector,
            message
        );

        if (_payWithNative) {
            if (fees > _amount) revert("Not enough native gas to pay fees");
            messageId = IRouterClient(CCIPReceiver.getRouter()).ccipSend{
                value: fees
            }(_destinationChainSelector, message);
        } else {
            if (fees > linkToken.balanceOf(address(this)))
                revert("Not enough LINK to pay fees");

            linkToken.approve(CCIPReceiver.getRouter(), fees);

            if (_includeTokens)
                IERC20(_token).approve(CCIPReceiver.getRouter(), _amount);

            messageId = IRouterClient(CCIPReceiver.getRouter()).ccipSend(
                _destinationChainSelector,
                message
            );
        }

        emit MessageSent(
            messageId,
            _destinationChainSelector,
            _receiver,
            _message,
            _includeTokens ? _token : address(0),
            _includeTokens ? _amount : 0,
            _payWithNative ? address(0) : address(linkToken),
            fees
        );

        return messageId;
    }

    function _ccipReceive(
        Client.Any2EVMMessage memory message
    ) internal override {
        if (
            keccak256(
                allowedDestinationRelayers[message.sourceChainSelector]
            ) != keccak256(message.sender)
        ) revert("Source chain or sender not allowlisted");

        // since we interchange addresses as bytes, lets unwusel this
        (bytes memory _calleeDecoded, bytes memory _data) = abi.decode(
            message.data,
            (bytes, bytes)
        );

        address _callee = abi.decode(_calleeDecoded, (address));

        // Safe handling of token amounts
        address tokenAddress;
        uint256 tokenAmount;
        if (message.destTokenAmounts.length > 0) {
            tokenAddress = message.destTokenAmounts[0].token;
            tokenAmount = message.destTokenAmounts[0].amount;
            if (tokenAddress != address(0) && tokenAmount > 0) {
                if (
                    IERC20(tokenAddress).balanceOf(address(this)) >= tokenAmount
                ) {
                    IERC20(tokenAddress).approve(_callee, tokenAmount);
                } else {
                    revert("Tokens not received");
                }
            }
        }

        // (bool _success, bytes memory _result) = _callee.call(_data);
        (bool _success, ) = _callee.call(_data);

        if (!_success) {
            // (, string memory err) = abi.decode(_result, (bytes4, string));
            // console.log(err);
            // console.log("B");
            revert("Failed call to callee");
        }

        emit MessageReceived(
            message.messageId,
            message.sourceChainSelector,
            message.sender,
            tokenAddress, // Will be address(0) if no tokens
            tokenAmount, // Will be 0 if no tokens
            _callee,
            _data
        );
    }

    function recoverAsset(address _asset) external onlyOwner {
        if (_asset == address(0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE)) {
            // payable(address(this)).transfer()
            // TODO transfer eth from contract to sender, check balance
        } else {
            // TODO transfer token from contract to sender, check balance
        }
    }
}
