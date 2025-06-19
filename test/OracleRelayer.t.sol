// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.24;

import {Test, console} from "forge-std/Test.sol";
import {OracleRelayer, IERC20} from "../src/OracleRelayer.sol";
import {MockUSDC} from "../src/mocks/MockUSDC.sol";
import {LINK as MockLINK} from "../src/mocks/MockLink.sol";
import {IRouterClient} from "@chainlink/contracts-ccip/contracts/interfaces/IRouterClient.sol";
import {Client} from "@chainlink/contracts-ccip/contracts/libraries/Client.sol";

//import {CCIPLocalSimulatorFork} from "@chainlink/local/src/ccip/CCIPLocalSimulatorFork.sol";
interface Callee {
    function doCall(uint256) external;

    function doCallWithReturn(uint256) external returns (bool);
}

contract OracleRelayerTest is Test {
    // Chain Selectors for different networks
    uint64 constant BASE_SEPOLIA_SELECTOR = 10344971235874465080;
    uint64 constant AVALANCHE_FUJI_SELECTOR = 14767482510784806043;
    uint64 constant ETHEREUM_SEPOLIA_SELECTOR = 16015286601757825753;
    uint64 constant ARBITRUM_SEPOLIA_SELECTOR = 3478487238524512106;

    // CCIP Router addresses on different networks
    address constant BASE_SEPOLIA_ROUTER =
        0x80AF2F44ed0469018922c9F483dc5A909862fdc2;
    address constant AVALANCHE_FUJI_ROUTER =
        0x554472a2720E5E7D5D3C817529aBA05EEd5F82D8;
    address constant ETHEREUM_SEPOLIA_ROUTER =
        0x0BF3dE8c5D3e8A2B34D2BEeB17ABfCeBaf363A59;
    address constant ARBITRUM_SEPOLIA_ROUTER =
        0x2a9C5afB0d0e4BAb2BCdaE109EC4b0c4Be15a165;

    uint256 baseSepoliaFork;
    uint256 avalancheFujiFork;
    uint256 ethereumSepoliaFork;
    uint256 arbitrumSepoliaFork;

    uint256 baseSepoliaChainId;
    uint256 avalancheFujiChainId;

    // CCIPLocalSimulatorFork public ccipSimulatorFork;

    OracleRelayer public sourceOracleRelayer;
    MockUSDC public mockUSDCSource;
    MockLINK public mockLINKSource;

    OracleRelayer public destOracleRelayer;
    MockUSDC public mockUSDCDest;
    MockLINK public mockLINKDest;
    address public owner;

    function setUp() public {
        // Create forks of different networks using RPC URLs from foundry.toml
        avalancheFujiFork = vm.createSelectFork(
            vm.envString("AVALANCHE_FUJI_RPC_URL")
        );
        baseSepoliaFork = vm.createFork(vm.envString("BASE_SEPOLIA_RPC_URL"));
        ethereumSepoliaFork = vm.createFork(
            vm.envString("ETHEREUM_SEPOLIA_RPC_URL")
        );
        arbitrumSepoliaFork = vm.createFork(
            vm.envString("ARBITRUM_SEPOLIA_RPC_URL")
        );

        //         ccipSimulatorFork = new CCIPLocalSimulatorFork();
        //         vm.makePersistent(address(ccipSimulatorFork));

        owner = address(this);

        // Deploy contracts on Base Sepolia
        vm.selectFork(baseSepoliaFork);
        baseSepoliaChainId = block.chainid;
        mockUSDCSource = new MockUSDC();
        mockLINKSource = new MockLINK();
        sourceOracleRelayer = new OracleRelayer(
            address(mockLINKSource),
            BASE_SEPOLIA_ROUTER
        );
        vm.makePersistent(address(sourceOracleRelayer));

        // Deploy contracts on Avalanche Fuji
        vm.selectFork(avalancheFujiFork);
        avalancheFujiChainId = block.chainid;
        mockUSDCDest = new MockUSDC();
        mockLINKDest = new MockLINK();
        destOracleRelayer = new OracleRelayer(
            address(mockLINKDest),
            AVALANCHE_FUJI_ROUTER
        );
        vm.makePersistent(address(destOracleRelayer));
    }

    function testCrossChainMessage() public {
        // Start on Base Sepolia
        vm.selectFork(baseSepoliaFork);

        // Allowlist destination chain (Avalanche Fuji)
        sourceOracleRelayer.addDestinationRelayer(
            avalancheFujiChainId,
            AVALANCHE_FUJI_SELECTOR,
            address(destOracleRelayer)
        );

        // allow test contract to send
        sourceOracleRelayer.addSenders(address(this));

        // Prepare message data
        address callee = makeAddr("callee");
        uint256 calleeParam = uint256(1337);
        bytes memory calleeSig = abi.encodeWithSelector(
            Callee.doCall.selector,
            calleeParam
        );
        bytes memory data = abi.encode(callee, calleeSig);

        // Mint and approve LINK tokens for fees
        mockLINKSource.mint(address(sourceOracleRelayer), 1000e18);

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
            data,
            false // pay with LINK
        );

        assertEq(messageId, expectedMessageId);

        // Switch to Avalanche Fuji
        vm.selectFork(avalancheFujiFork);

        // Allowlist source chain and sender
        destOracleRelayer.addDestinationRelayer(
            baseSepoliaChainId,
            BASE_SEPOLIA_SELECTOR,
            address(sourceOracleRelayer)
        );

        // allow test contract to send
        destOracleRelayer.addSenders(address(this));

        // Since your contract always accesses destTokenAmounts[0], we need to provide at least one token
        // even for "message only" tests. Use a dummy token with 0 amount.
        Client.Any2EVMMessage memory any2evmMessage = Client.Any2EVMMessage({
            messageId: messageId,
            sourceChainSelector: BASE_SEPOLIA_SELECTOR,
            sender: abi.encode(address(sourceOracleRelayer)),
            data: data,
            destTokenAmounts: new Client.EVMTokenAmount[](0) // Must have at least 1 element
        });

        vm.mockCall(callee, calleeSig, abi.encode(""));

        // Receive message
        destOracleRelayer.ccipReceive(any2evmMessage);
    }

    function test_addDestinationRelayer_Successfull() public {
        vm.selectFork(baseSepoliaFork);
        uint256 chainId = 1234;
        uint64 chainSelector = 1234;
        sourceOracleRelayer.addDestinationRelayer(
            chainId,
            chainSelector,
            address(0x1234)
        );
        assertEq(
            sourceOracleRelayer.allowedDestinationRelayers(chainSelector),
            abi.encode(address(0x1234))
        );
        sourceOracleRelayer.removeDestinationRelayer(chainId);
        assertEq(
            sourceOracleRelayer.allowedDestinationRelayers(chainSelector),
            bytes("")
        );
    }

    function test_sendMessage_RevertIf_InvalidSender() public {
        vm.selectFork(baseSepoliaFork);
        uint64 chainId = 9999;
        bytes memory message = abi.encode("Hello");
        bool payWithNative = false;
        vm.expectRevert("Invalid sender");
        sourceOracleRelayer.sendMessage(chainId, message, payWithNative);
    }

    function test_sendMessageWithToken_Successful() public {
        vm.selectFork(baseSepoliaFork);

        uint256 chainId = 1234;
        uint64 chainSelector = 1234;
        address testRelayer = address(0x1234);
        sourceOracleRelayer.addDestinationRelayer(
            chainId,
            chainSelector,
            testRelayer
        );
        sourceOracleRelayer.addSenders(address(this));
        bytes memory message = abi.encode("Hello");
        address token = address(mockUSDCSource);
        uint256 amount = 100e6;
        bool includeTokens = true;
        bool payWithNative = false;

        // Create the expected token amounts array
        Client.EVMTokenAmount[]
            memory tokenAmounts = new Client.EVMTokenAmount[](1);
        tokenAmounts[0] = Client.EVMTokenAmount({token: token, amount: amount});

        // Create the expected message structure
        Client.EVM2AnyMessage memory expectedMessage = Client.EVM2AnyMessage({
            receiver: abi.encode(testRelayer),
            data: message,
            tokenAmounts: tokenAmounts,
            extraArgs: Client._argsToBytes(
                Client.GenericExtraArgsV2({
                    gasLimit: 900_000,
                    allowOutOfOrderExecution: false
                })
            ),
            feeToken: address(mockLINKSource)
        });

        // Mock the router's getFee function
        vm.mockCall(
            BASE_SEPOLIA_ROUTER,
            abi.encodeWithSelector(
                IRouterClient.getFee.selector,
                chainSelector,
                expectedMessage
            ),
            abi.encode(uint256(10e18))
        );

        // Mock the router's ccipSend function
        bytes32 expectedMessageId = bytes32(uint256(0x123));
        vm.mockCall(
            BASE_SEPOLIA_ROUTER,
            abi.encodeWithSelector(
                IRouterClient.ccipSend.selector,
                chainSelector,
                expectedMessage
            ),
            abi.encode(expectedMessageId)
        );

        // Mint and approve tokens
        mockUSDCSource.mint(address(this), amount);
        mockUSDCSource.approve(address(sourceOracleRelayer), amount);
        mockLINKSource.mint(address(sourceOracleRelayer), 10e18);

        // Send message with token
        bytes32 messageId = sourceOracleRelayer.sendMessageWithToken(
            chainSelector,
            message,
            token,
            amount,
            includeTokens,
            payWithNative
        );

        assertEq(messageId, expectedMessageId);
    }

    function test_ccipReceive_Successful() public {
        vm.selectFork(avalancheFujiFork);

        uint256 sourceChainId = 5678;
        uint64 sourceChainSelector = 5678;
        address sender = address(0xBEEF);
        destOracleRelayer.addDestinationRelayer(
            sourceChainId,
            sourceChainSelector,
            sender
        );

        bytes32 messageId = bytes32(uint256(0x456));
        address callee = address(0xDEAD);
        string memory text = "Test Data";

        // Since your contract always accesses destTokenAmounts[0], provide dummy token
        Client.Any2EVMMessage memory message = Client.Any2EVMMessage({
            messageId: messageId,
            sourceChainSelector: sourceChainSelector,
            sender: abi.encode(sender),
            data: abi.encode(callee, abi.encode(text)),
            destTokenAmounts: new Client.EVMTokenAmount[](0) // Must have at least 1 element
        });

        // This should not revert
        destOracleRelayer.ccipReceive(message);
    }

    function test_ccipReceive_WithTokens_Successful() public {
        vm.selectFork(avalancheFujiFork);

        uint256 sourceChainId = 5678;
        uint64 sourceChainSelector = 5678;
        address sender = address(0xBEEF);
        destOracleRelayer.addDestinationRelayer(
            sourceChainId,
            sourceChainSelector,
            sender
        );

        bytes32 messageId = bytes32(uint256(0x456));
        address token = address(mockUSDCSource);
        uint256 amount = 200e6;
        address callee = makeAddr("callee");
        uint256 calleeParam = uint256(1337);
        bytes memory calleeSig = abi.encodeWithSelector(
            Callee.doCall.selector,
            calleeParam
        );
        bytes memory data = abi.encode(callee, calleeSig);

        // Create message with tokens - ensure proper data encoding
        Client.Any2EVMMessage memory message = Client.Any2EVMMessage({
            messageId: messageId,
            sourceChainSelector: sourceChainSelector,
            sender: abi.encode(sender),
            data: data,
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
            abi.encodeWithSelector(
                IERC20.balanceOf.selector,
                address(destOracleRelayer)
            ),
            abi.encode(amount)
        );

        vm.mockCall(
            token,
            abi.encodeWithSelector(IERC20.approve.selector, callee, amount),
            abi.encode(true)
        );

        vm.mockCall(callee, calleeSig, bytes(""));

        // This should not revert
        destOracleRelayer.ccipReceive(message);
    }

    function test_ccipReceive_RevertIf_NotAllowlisted() public {
        vm.selectFork(avalancheFujiFork);

        uint64 sourceChainId = 9999; // Not allowlisted
        address sender = address(0xBEEF);

        bytes32 messageId = bytes32(uint256(0x456));
        address callee = address(0xDEAD);
        bytes memory message = abi.encode("Test Data");

        // Even for failing tests, need to provide token array to prevent bounds error
        Client.Any2EVMMessage memory any2evmMessage = Client.Any2EVMMessage({
            messageId: messageId,
            sourceChainSelector: sourceChainId,
            sender: abi.encode(sender),
            data: abi.encode(callee, message),
            destTokenAmounts: new Client.EVMTokenAmount[](0)
        });

        vm.expectRevert("Source chain or sender not allowlisted");
        destOracleRelayer.ccipReceive(any2evmMessage);
    }

    function test_ccipReceive_RevertIf_CalleeCallFails() public {
        uint256 sourceChainId = 9999; // Not allowlisted
        uint64 sourceChainSelector = 9999; // Not allowlisted
        address sender = address(0xBEEF);

        bytes32 messageId = bytes32(uint256(0x456));
        address callee = address(0xDEAD);
        uint256 calleeParam = uint256(1337);
        bytes memory calleeSig = abi.encodeWithSelector(
            Callee.doCallWithReturn.selector,
            calleeParam
        );
        bytes memory data = abi.encode(callee, calleeSig);

        // Even for failing tests, need to provide token array to prevent bounds error
        Client.Any2EVMMessage memory any2evmMessage = Client.Any2EVMMessage({
            messageId: messageId,
            sourceChainSelector: sourceChainSelector,
            sender: abi.encode(sender),
            data: data,
            destTokenAmounts: new Client.EVMTokenAmount[](0)
        });

        vm.selectFork(avalancheFujiFork);

        // add this to receive proper message
        mockLINKDest.mint(address(destOracleRelayer), 1e18);
        destOracleRelayer.addDestinationRelayer(
            sourceChainId,
            sourceChainSelector,
            sender
        );

        vm.mockCallRevert(callee, calleeSig, bytes(""));

        vm.expectRevert("Failed call to callee");
        destOracleRelayer.ccipReceive(any2evmMessage);
    }

    function test_recoverAssets_Ether_Successful() public {
        vm.selectFork(baseSepoliaFork);

        address _relayer = address(sourceOracleRelayer);

        deal(_relayer, 1 ether);

        assertEq(
            _relayer.balance,
            1 ether,
            "Relayer should have a balance of 1 ether"
        );

        uint256 _balanceBefore = address(this).balance;

        sourceOracleRelayer.recoverAsset(
            address(0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE)
        );

        assertEq(_relayer.balance, 0, "Relayer should have no balance");
        assertEq(address(this).balance - _balanceBefore, 1 ether);
    }

    function test_recoverAssets_Address_Successful() public {
        vm.selectFork(baseSepoliaFork);
        mockLINKSource.mint(address(sourceOracleRelayer), 1e18);
        uint256 _balanceBefore = mockLINKSource.balanceOf(address(this));
        sourceOracleRelayer.recoverAsset(address(mockLINKSource));
        assertEq(
            mockLINKSource.balanceOf(address(sourceOracleRelayer)),
            0,
            "Relayer should have no asset balance"
        );
        assertEq(
            mockLINKSource.balanceOf(address(this)) - _balanceBefore,
            1e18
        );
    }

    function test_recoverAssets_RevertIf_InsufficientBalances() public {
        vm.selectFork(baseSepoliaFork);

        vm.expectRevert("Native balance insufficient");
        sourceOracleRelayer.recoverAsset(
            address(0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE)
        );

        vm.expectRevert("Asset balance insufficient");
        sourceOracleRelayer.recoverAsset(address(mockLINKSource));
    }

    receive() external payable {}
}
