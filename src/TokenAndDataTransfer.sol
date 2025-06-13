// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IRouterClient} from "@chainlink/contracts-ccip/contracts/interfaces/IRouterClient.sol";
import {CCIPReceiver} from "@chainlink/contracts-ccip/contracts/applications/CCIPReceiver.sol";
import {Client} from "@chainlink/contracts-ccip/contracts/libraries/Client.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";


contract OracleRelayer is CCIPReceiver {
    using SafeERC20 for IERC20;

    // Define roles for access control

    IERC20 public immutable linkToken;

    mapping(uint64 => bool) public allowlistedDestinationChains;
    mapping(uint64 => mapping(address => bool))
        public allowlistedSourceChainAndSender;

    event MessageSent(
        bytes32 indexed messageId,
        uint64 indexed destinationChainSelector,
        address receiver,
        string text,
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

    constructor(address _linkToken, address _router) CCIPReceiver(_router) {
        require(_linkToken != address(0), "Invalid LINK token address");
        require(_router != address(0), "Invalid router address");
        linkToken = IERC20(_linkToken);
    }

    function allowlistDestinationChain(
        uint64 _destinationChainSelector,
        bool _allowed
    ) external {
        allowlistedDestinationChains[_destinationChainSelector] = _allowed;
    }

    function allowlistSourceChainAndSender(
        uint64 _sourceChainSelector,
        address _sender,
        bool _allowed
    ) external {
        allowlistedSourceChainAndSender[_sourceChainSelector][
            _sender
        ] = _allowed;
    }

    function _sendMessageWithToken(
        uint64 _destinationChainSelector,
        address _receiver,
        string calldata _text,
        address _token,
        uint256 _amount,
        bool _includeTokens,
        bool _payWithNative
    ) internal returns (bytes32 messageId) {
        require(
            allowlistedDestinationChains[_destinationChainSelector],
            "Destination chain not allowlisted"
        );

        Client.EVMTokenAmount[]
            memory tokenAmounts = new Client.EVMTokenAmount[](1);
        if (_includeTokens) {
            require(_token != address(0), "Token address cannot be zero");
            require(_amount > 0, "Amount must be greater than zero");
            tokenAmounts[0] = Client.EVMTokenAmount({
                token: _token,
                amount: _amount
            });
        } else {
            tokenAmounts[0] = Client.EVMTokenAmount({
                token: address(0),
                amount: 0
            });
        }

        Client.EVM2AnyMessage memory message = Client.EVM2AnyMessage({
            receiver: abi.encode(_receiver),
            data: abi.encode(_text),
            tokenAmounts: tokenAmounts,
            extraArgs: Client._argsToBytes(
                Client.GenericExtraArgsV2({
                    gasLimit: 200_000,
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
            require(_amount >= fees, "Not enough native gas to pay fees");
            messageId = IRouterClient(CCIPReceiver.getRouter()).ccipSend{
                value: fees
            }(_destinationChainSelector, message);
        } else {
            require(
                linkToken.balanceOf(address(this)) >= fees,
                "Not enough LINK to pay fees"
            );
            linkToken.safeApprove(address(CCIPReceiver.getRouter()), fees);
            if (_includeTokens) {
                IERC20(_token).safeApprove(
                    address(CCIPReceiver.getRouter()),
                    _amount
                );
            }
            messageId = IRouterClient(CCIPReceiver.getRouter()).ccipSend(
                _destinationChainSelector,
                message
            );
        }

        emit MessageSent(
            messageId,
            _destinationChainSelector,
            _receiver,
            _text,
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
        address sender = abi.decode(message.sender, (address));
        require(
            allowlistedSourceChainAndSender[message.sourceChainSelector][
                sender
            ],
            "Source chain or sender not allowlisted"
        );

        (address _callee, bytes memory _data) = abi.decode(
            message.data,
            (address, bytes)
        );

        // Safe handling of token amounts - check if tokens were sent
        address tokenAddress = address(0);
        uint256 tokenAmount = 0;

        if (message.destTokenAmounts.length > 0) {
            tokenAddress = message.destTokenAmounts[0].token;
            tokenAmount = message.destTokenAmounts[0].amount;
        }

        emit MessageReceived(
            message.messageId,
            message.sourceChainSelector,
            sender,
            tokenAddress, // Will be address(0) if no tokens
            tokenAmount, // Will be 0 if no tokens
            _callee,
            _data
        );
    }

    function ccipReceive(
        Client.Any2EVMMessage calldata message
    ) external override {
        _ccipReceive(message);
    }

    function sendMessageWithToken(
        uint64 _destinationChainSelector,
        address _receiver,
        string calldata _text,
        address _token,
        uint256 _amount,
        bool _includeTokens,
        bool _payWithNative
    ) external returns (bytes32 messageId) {
        return
            _sendMessageWithToken(
                _destinationChainSelector,
                _receiver,
                _text,
                _token,
                _amount,
                _includeTokens,
                _payWithNative
            );
    }

    function sendMessage(
        uint64 _destinationChainSelector,
        address _receiver,
        string calldata _text,
        bool _payWithNative
    ) external returns (bytes32 messageId) {
        return
            _sendMessageWithToken(
                _destinationChainSelector,
                _receiver,
                _text,
                address(0),
                0,
                false,
                _payWithNative
            );
    }

    receive() external payable {}
}
