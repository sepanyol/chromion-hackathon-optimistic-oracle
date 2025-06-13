//SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
import {Test, console} from "forge-std/Test.sol";
import {OracleRelayer} from "../src/TokenAndDataTransfer.sol";
import {MockUSDC} from "../src/mocks/MockUSDC.sol";
import {LINK as MockLINK} from "../src/mocks/MockLink.sol";
import {IRouterClient} from "@chainlink/contracts-ccip/contracts/interfaces/IRouterClient.sol";
import {Client} from "@chainlink/contracts-ccip/contracts/libraries/Client.sol";
//import {CCIPLocalSimulatorFork} from "@chainlink/local/src/ccip/CCIPLocalSimulatorFork.sol";

contract TokenAndDataTransferTest is Test {
    // Chain Selectors for different networks
    uint64 constant BASE_SEPOLIA_SELECTOR = 10344971235874465080;
    uint64 constant AVALANCHE_FUJI_SELECTOR = 14767482510784806043;
    uint64 constant ETHEREUM_SEPOLIA_SELECTOR = 16015286601757825753;
    uint64 constant ARBITRUM_SEPOLIA_SELECTOR = 3478487238524512106;

    // CCIP Router addresses on different networks
    address constant BASE_SEPOLIA_ROUTER = 0x80AF2F44ed0469018922c9F483dc5A909862fdc2;
    address constant AVALANCHE_FUJI_ROUTER = 0x554472a2720E5E7D5D3C817529aBA05EEd5F82D8;
    address constant ETHEREUM_SEPOLIA_ROUTER = 0x0BF3dE8c5D3e8A2B34D2BEeB17ABfCeBaf363A59;
    address constant ARBITRUM_SEPOLIA_ROUTER = 0x2a9C5afB0d0e4BAb2BCdaE109EC4b0c4Be15a165;

    uint256 baseSepoliaFork;
    uint256 avalancheFujiFork;
    uint256 ethereumSepoliaFork;
    uint256 arbitrumSepoliaFork;

    // CCIPLocalSimulatorFork public ccipSimulatorFork;

    OracleRelayer public sourceOracleRelayer;
    OracleRelayer public destOracleRelayer;
    MockUSDC public mockUSDC;
    MockLINK public mockLINK;
    address public owner;


    function setUp() public {
        // Create forks of different networks using RPC URLs from foundry.toml
        baseSepoliaFork = vm.createSelectFork("BASE_SEPOLIA_RPC_URL");
        avalancheFujiFork = vm.createSelectFork("AVALANCHE_FUJI_RPC_URL");
        ethereumSepoliaFork = vm.createSelectFork("ETHEREUM_SEPOLIA_RPC_URL");
        arbitrumSepoliaFork = vm.createSelectFork("ARBITRUM_SEPOLIA_RPC_URL");

        //         ccipSimulatorFork = new CCIPLocalSimulatorFork();
        //         vm.makePersistent(address(ccipSimulatorFork));

        owner = address(this);

        // Deploy contracts on Base Sepolia
        vm.selectFork(baseSepoliaFork);
        mockUSDC = new MockUSDC();
        mockLINK = new MockLINK();
        sourceOracleRelayer = new OracleRelayer(
            address(mockLINK),
            BASE_SEPOLIA_ROUTER
        );

        // Deploy contracts on Avalanche Fuji
        vm.selectFork(avalancheFujiFork);
        MockLINK destMockLINK = new MockLINK();
        destOracleRelayer = new OracleRelayer(
            address(destMockLINK),
            AVALANCHE_FUJI_ROUTER
        );
    }

    function testCrossChainMessage() public {
        // Start on Base Sepolia
        vm.selectFork(baseSepoliaFork);
        
        // Allowlist destination chain (Avalanche Fuji)
        sourceOracleRelayer.allowlistDestinationChain(AVALANCHE_FUJI_SELECTOR, true);
        
        // Prepare message data
        address receiver = address(0xCAFE);
        string memory text = "Hello from Base Sepolia";
        
        // Mint and approve LINK tokens for fees
        mockLINK.mint(address(sourceOracleRelayer), 1000e18);

        // Mock the router calls for sending message
        vm.mockCall(
            BASE_SEPOLIA_ROUTER,
            abi.encodeWithSelector(IRouterClient.getFee.selector),
            abi.encode(1000e18) // Mock fee
        );

        bytes32 expectedMessageId = bytes32(uint256(0x123456789));
        vm.mockCall(
            BASE_SEPOLIA_ROUTER,
            abi.encodeWithSelector(IRouterClient.ccipSend.selector),
            abi.encode(expectedMessageId)
        );

        // Send message to Avalanche Fuji (no tokens)
        bytes32 messageId = sourceOracleRelayer.sendMessage(
            AVALANCHE_FUJI_SELECTOR,
            receiver,
            text,
            false // pay with LINK
        );

        assertEq(messageId, expectedMessageId);

        // Switch to Avalanche Fuji
        vm.selectFork(avalancheFujiFork);
        
        // Allowlist source chain and sender
        destOracleRelayer.allowlistSourceChainAndSender(
            BASE_SEPOLIA_SELECTOR,
            address(sourceOracleRelayer),
            true
        );

        // Since your contract always accesses destTokenAmounts[0], we need to provide at least one token
        // even for "message only" tests. Use a dummy token with 0 amount.
        Client.Any2EVMMessage memory message = Client.Any2EVMMessage({
            messageId: messageId,
            sourceChainSelector: BASE_SEPOLIA_SELECTOR,
            sender: abi.encode(address(sourceOracleRelayer)),
            data: abi.encode(receiver, abi.encode(text)),
            destTokenAmounts: new Client.EVMTokenAmount[](1) // Must have at least 1 element
        });
        
        // Add dummy token with 0 amount to prevent array bounds error
        message.destTokenAmounts[0] = Client.EVMTokenAmount({
            token: address(mockUSDC), // Dummy token
            amount: 0 // No actual tokens
        });

        // Receive message
        destOracleRelayer.ccipReceive(message);
    }

    function testAllowlistDestinationChain() public {
        vm.selectFork(baseSepoliaFork);
        uint64 chainId = 1234;
        sourceOracleRelayer.allowlistDestinationChain(chainId, true);
        assertTrue(sourceOracleRelayer.allowlistedDestinationChains(chainId));
        sourceOracleRelayer.allowlistDestinationChain(chainId, false);
        assertFalse(sourceOracleRelayer.allowlistedDestinationChains(chainId));
    }

    function testAllowlistSourceChainAndSender() public {
        vm.selectFork(baseSepoliaFork);
        uint64 chainId = 5678;
        address sender = address(0xBEEF);
        sourceOracleRelayer.allowlistSourceChainAndSender(chainId, sender, true);
        assertTrue(sourceOracleRelayer.allowlistedSourceChainAndSender(chainId, sender));
        sourceOracleRelayer.allowlistSourceChainAndSender(chainId, sender, false);
        assertFalse(sourceOracleRelayer.allowlistedSourceChainAndSender(chainId, sender));
    }

    function testSendMessageRevertsIfNotAllowlisted() public {
        vm.selectFork(baseSepoliaFork);
        uint64 chainId = 9999;
        address receiver = address(0xCAFE);
        string memory text = "Hello";
        bool payWithNative = false;
        vm.expectRevert("Destination chain not allowlisted");
        sourceOracleRelayer.sendMessage(chainId, receiver, text, payWithNative);
    }

    function testSendMessageWithToken() public {
        vm.selectFork(baseSepoliaFork);
        
        uint64 chainId = 1234;
        sourceOracleRelayer.allowlistDestinationChain(chainId, true);
        address receiver = address(0xCAFE);
        string memory text = "Hello";
        address token = address(mockUSDC);
        uint256 amount = 100e6;
        bool includeTokens = true;
        bool payWithNative = false;

        // Create the expected token amounts array
        Client.EVMTokenAmount[] memory tokenAmounts = new Client.EVMTokenAmount[](1);
        tokenAmounts[0] = Client.EVMTokenAmount({
            token: token,
            amount: amount
        });

        // Create the expected message structure
        Client.EVM2AnyMessage memory expectedMessage = Client.EVM2AnyMessage({
            receiver: abi.encode(receiver),
            data: abi.encode(text),
            tokenAmounts: tokenAmounts,
            extraArgs: Client._argsToBytes(Client.GenericExtraArgsV2({
                gasLimit: 200_000, 
                allowOutOfOrderExecution: false
            })),
            feeToken: address(mockLINK)
        });

        // Mock the router's getFee function
        vm.mockCall(
            BASE_SEPOLIA_ROUTER,
            abi.encodeWithSelector(IRouterClient.getFee.selector, chainId, expectedMessage),
            abi.encode(1000e18)
        );

        // Mock the router's ccipSend function
        bytes32 expectedMessageId = bytes32(uint256(0x123));
        vm.mockCall(
            BASE_SEPOLIA_ROUTER,
            abi.encodeWithSelector(IRouterClient.ccipSend.selector, chainId, expectedMessage),
            abi.encode(expectedMessageId)
        );

        // Mint and approve tokens
        mockUSDC.mint(address(this), amount);
        mockUSDC.approve(address(sourceOracleRelayer), amount);
        mockLINK.mint(address(sourceOracleRelayer), 1000e18);

        // Send message with token
        bytes32 messageId = sourceOracleRelayer.sendMessageWithToken(
            chainId, 
            receiver, 
            text, 
            token, 
            amount, 
            includeTokens, 
            payWithNative
        );
        
        assertEq(messageId, expectedMessageId);
        
    }

    function testCcipReceive() public {
        vm.selectFork(avalancheFujiFork);
        
        uint64 sourceChainId = 5678;
        address sender = address(0xBEEF);
        destOracleRelayer.allowlistSourceChainAndSender(sourceChainId, sender, true);
        
        bytes32 messageId = bytes32(uint256(0x456));
        address callee = address(0xDEAD);
        string memory text = "Test Data";
        
        // Since your contract always accesses destTokenAmounts[0], provide dummy token
        Client.Any2EVMMessage memory message = Client.Any2EVMMessage({
            messageId: messageId,
            sourceChainSelector: sourceChainId,
            sender: abi.encode(sender),
            data: abi.encode(callee, abi.encode(text)),
            destTokenAmounts: new Client.EVMTokenAmount[](1) // Must have at least 1 element
        });
        
        // Add dummy token with 0 amount
        message.destTokenAmounts[0] = Client.EVMTokenAmount({
            token: address(mockUSDC),
            amount: 0
        });

        // This should not revert
        destOracleRelayer.ccipReceive(message);
    }

    function testCcipReceiveWithTokens() public {
        vm.selectFork(avalancheFujiFork);
        
        uint64 sourceChainId = 5678;
        address sender = address(0xBEEF);
        destOracleRelayer.allowlistSourceChainAndSender(sourceChainId, sender, true);
        
        bytes32 messageId = bytes32(uint256(0x456));
        address token = address(mockUSDC);
        uint256 amount = 200e6;
        address callee = address(0xDEAD);
        string memory text = "Test Data";
        
        // Create message with tokens - ensure proper data encoding
        Client.Any2EVMMessage memory message = Client.Any2EVMMessage({
            messageId: messageId,
            sourceChainSelector: sourceChainId,
            sender: abi.encode(sender),
            data: abi.encode(callee, abi.encode(text)), // Double encoding to match expected format
            destTokenAmounts: new Client.EVMTokenAmount[](1)
        });
        message.destTokenAmounts[0] = Client.EVMTokenAmount({
            token: token, 
            amount: amount
        });

        // Mock the ERC20 transfer to simulate CCIP behavior
        // CCIP automatically transfers tokens to the receiving contract
        vm.mockCall(
            token,
            abi.encodeWithSelector(bytes4(keccak256("balanceOf(address)")), address(destOracleRelayer)),
            abi.encode(amount)
        );
        
        vm.mockCall(
            token,
            abi.encodeWithSelector(bytes4(keccak256("transfer(address,uint256)")), callee, amount),
            abi.encode(true)
        );

        // This should not revert
        destOracleRelayer.ccipReceive(message);
    }

    function testReceiveMessageRevertsIfNotAllowlisted() public {
        vm.selectFork(avalancheFujiFork);
        
        uint64 sourceChainId = 9999; // Not allowlisted
        address sender = address(0xBEEF);
        
        bytes32 messageId = bytes32(uint256(0x456));
        address callee = address(0xDEAD);
        string memory text = "Test Data";
        
        // Even for failing tests, need to provide token array to prevent bounds error
        Client.Any2EVMMessage memory message = Client.Any2EVMMessage({
            messageId: messageId,
            sourceChainSelector: sourceChainId,
            sender: abi.encode(sender),
            data: abi.encode(callee, abi.encode(text)),
            destTokenAmounts: new Client.EVMTokenAmount[](1)
        });
        
        message.destTokenAmounts[0] = Client.EVMTokenAmount({
            token: address(mockUSDC),
            amount: 0
        });

        vm.expectRevert("Source chain or sender not allowlisted");
        destOracleRelayer.ccipReceive(message);
    }
}