// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.24;

import "forge-std/Test.sol";

import {IAccessControl} from "@openzeppelin/contracts/access/IAccessControl.sol";
import {CCIPLocalSimulatorFork, Register} from "@chainlink/local/src/ccip/CCIPLocalSimulatorFork.sol";
import {IRouterClient} from "@chainlink/contracts-ccip/contracts/interfaces/IRouterClient.sol";
import {BurnMintERC677Helper, IERC20} from "@chainlink/local/src/ccip/CCIPLocalSimulator.sol";

import {OracleCoordinator, IOracleCoordinator} from "./../src/OracleCoordinator.sol";
import {RequestFactory, IRequestFactory, RequestTypes} from "./../src/RequestFactory.sol";
import {OracleRelayer, IOracleRelayer} from "./../src/OracleRelayer.sol";
import {IBaseRequestContract} from "./../src/interfaces/IBaseRequestContract.sol";

contract CrossChainIntegrationTest is Test {
    CCIPLocalSimulatorFork public ccipLocalSimulatorFork;

    uint256 public oracleChainFork;
    uint256 public crossChainFork;

    IRouterClient public oracleChainRouter;
    IRouterClient public crossChainRouter;

    uint64 public oracleChainSelector;
    uint64 public crossChainSelector;

    BurnMintERC677Helper public oracleChainCCIPBnMToken;
    BurnMintERC677Helper public crossChainCCIPBnMToken;

    IERC20 public oracleChainLinkToken;
    IERC20 public crossChainLinkToken;

    address public owner;
    address public finalizer;
    address public requester;
    address public proposer;
    address public challenger;
    address public reviewer1;
    address public reviewer2;
    address public reviewer3;
    address public reviewer4;
    address public reviewer5;
    address public reviewer6;

    IRequestFactory oracleChainRequestFactory;
    IRequestFactory crossChainRequestFactory;

    IOracleRelayer oracleChainRelayer;
    IOracleRelayer crossChainRelayer;

    uint256 oracleChainId;
    uint256 crossChainId;

    IOracleCoordinator coordinator;

    function setUp() public {
        string memory ORACLE_RPC_URL = vm.envString("AVALANCHE_FUJI_RPC_URL");
        string memory CROSS_CHAIN_RPC_URL = vm.envString(
            "ETHEREUM_SEPOLIA_RPC_URL"
        );

        oracleChainFork = vm.createSelectFork(ORACLE_RPC_URL);
        crossChainFork = vm.createFork(CROSS_CHAIN_RPC_URL);

        // oracle chain id, because selected first
        oracleChainId = block.chainid;

        owner = makeAddr("owner");
        requester = makeAddr("requester");
        proposer = makeAddr("proposer");
        challenger = makeAddr("challenger");
        reviewer1 = makeAddr("reviewer1");
        reviewer2 = makeAddr("reviewer2");
        reviewer3 = makeAddr("reviewer3");
        reviewer4 = makeAddr("reviewer4");
        reviewer5 = makeAddr("reviewer5");
        reviewer6 = makeAddr("reviewer6");

        ccipLocalSimulatorFork = new CCIPLocalSimulatorFork();
        vm.makePersistent(address(ccipLocalSimulatorFork));

        Register.NetworkDetails
            memory oracleChainNetworkDetails = ccipLocalSimulatorFork
                .getNetworkDetails(block.chainid);
        oracleChainCCIPBnMToken = BurnMintERC677Helper(
            oracleChainNetworkDetails.ccipBnMAddress
        );
        oracleChainSelector = oracleChainNetworkDetails.chainSelector;
        oracleChainRouter = IRouterClient(
            oracleChainNetworkDetails.routerAddress
        );
        oracleChainLinkToken = IERC20(oracleChainNetworkDetails.linkAddress);

        vm.selectFork(crossChainFork);
        crossChainId = block.chainid;
        Register.NetworkDetails
            memory crossChainNetworkDetails = ccipLocalSimulatorFork
                .getNetworkDetails(block.chainid);
        crossChainCCIPBnMToken = BurnMintERC677Helper(
            crossChainNetworkDetails.ccipBnMAddress
        );
        crossChainSelector = crossChainNetworkDetails.chainSelector;
        crossChainRouter = IRouterClient(
            crossChainNetworkDetails.routerAddress
        );
        crossChainLinkToken = IERC20(crossChainNetworkDetails.linkAddress);

        // prepare oracle chain
        vm.selectFork(oracleChainFork);
        oracleChainRelayer = new OracleRelayer(
            address(oracleChainLinkToken),
            address(oracleChainRouter)
        );
        coordinator = new OracleCoordinator(
            owner,
            address(oracleChainRelayer),
            address(oracleChainCCIPBnMToken)
        );
        oracleChainRequestFactory = new RequestFactory(
            address(oracleChainCCIPBnMToken),
            address(coordinator),
            address(0),
            true
        );

        // grant roles on coordinator (finalizer and factory)
        vm.startPrank(owner);

        // set roles
        IAccessControl(address(coordinator)).grantRole(
            coordinator.FINALIZER_ROLE(),
            finalizer
        );
        IAccessControl(address(coordinator)).grantRole(
            coordinator.FACTORY_ROLE(),
            address(oracleChainRequestFactory)
        );
        vm.stopPrank();

        // prepare cross chain

        vm.selectFork(crossChainFork);
        crossChainRelayer = new OracleRelayer(
            address(crossChainLinkToken),
            address(crossChainRouter)
        );
        crossChainRequestFactory = new RequestFactory(
            address(crossChainCCIPBnMToken),
            address(crossChainRelayer),
            address(oracleChainRequestFactory),
            false
        );

        // cross chain relayer configuration
        crossChainRelayer.addDestinationRelayer(
            crossChainId,
            oracleChainSelector,
            address(oracleChainRelayer)
        );
        crossChainRelayer.addSenders(address(crossChainRequestFactory));

        // fund relayer with link
        ccipLocalSimulatorFork.requestLinkFromFaucet(
            address(crossChainRelayer),
            10 ether
        );

        // oracle chain relayer configuration
        vm.selectFork(oracleChainFork);
        oracleChainRelayer.addDestinationRelayer(
            crossChainId,
            crossChainSelector,
            address(crossChainRelayer)
        );
        oracleChainRelayer.addSenders(address(coordinator));
        ccipLocalSimulatorFork.requestLinkFromFaucet(
            address(oracleChainRelayer),
            10 ether
        );
    }

    function test_setUp() public pure {
        assertTrue(true);
    }

    function test_createRequest_CrossChain_Successfull_Registered_OracleChain()
        public
    {
        vm.selectFork(crossChainFork);

        crossChainCCIPBnMToken.drip(requester);

        vm.startPrank(requester);
        crossChainCCIPBnMToken.approve(address(crossChainRequestFactory), 1e10);
        address createdRequest = crossChainRequestFactory.createRequest(
            RequestTypes.RequestParams({
                requester: abi.encode(requester),
                originAddress: abi.encode(address(0)), // will be set by factory (isOracleChain=true, isCrossChain=true)
                originChainId: abi.encode(uint64(0)), // will be set by factory (isOracleChain=true, isCrossChain=true)
                answerType: RequestTypes.AnswerType.Bool,
                challengeWindow: 86400,
                rewardAmount: 1e10,
                question: "Test Question",
                context: "Test Context",
                truthMeaning: "Test Truth Meaning",
                isCrossChain: true
            })
        );
        vm.stopPrank();

        // vm.expectEmit(true, true, false, false);
        // emit IOracleCoordinator.RequestRegistered(
        //     address(0),
        //     abi.encode(address(0))
        // );

        assertEq(
            uint256(IBaseRequestContract(createdRequest).status()),
            uint256(RequestTypes.RequestStatus.Pending),
            "Newly created request contract should have status pending"
        );

        // IMPORTANT TO DO THIS
        ccipLocalSimulatorFork.switchChainAndRouteMessage(oracleChainFork);

        // here happens request register
        // here happens attestation for request
        // here happens call back to origin request chain

        ccipLocalSimulatorFork.switchChainAndRouteMessage(crossChainFork);

        assertEq(
            uint256(IBaseRequestContract(createdRequest).status()),
            uint256(RequestTypes.RequestStatus.Open),
            "Request should have status open after oracle chain sends message"
        );
    }
}
