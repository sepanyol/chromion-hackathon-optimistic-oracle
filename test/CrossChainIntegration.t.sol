// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.24;

import "forge-std/Test.sol";

import {IAccessControl} from "@openzeppelin/contracts/access/IAccessControl.sol";
import {CCIPLocalSimulatorFork, Register} from "@chainlink/local/src/ccip/CCIPLocalSimulatorFork.sol";
import {IRouterClient} from "@chainlink/contracts-ccip/contracts/interfaces/IRouterClient.sol";
import {BurnMintERC677Helper, IERC20} from "@chainlink/local/src/ccip/CCIPLocalSimulator.sol";

import {OracleCoordinator, IOracleCoordinator} from "./../src/OracleCoordinator.sol";
import {RequestFactory, IRequestFactory} from "./../src/RequestFactory.sol";

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

    // TODO relayer
    address oracleChainRelayer;
    address crossChainRelayer;

    IOracleCoordinator coordinator;

    function setUp() public {
        string memory ORACLE_RPC_URL = vm.envString("AVALANCHE_FUJI_RPC_URL");
        string memory CROSS_CHAIN_RPC_URL = vm.envString(
            "ETHEREUM_SEPOLIA_RPC_URL"
        );

        oracleChainFork = vm.createSelectFork(ORACLE_RPC_URL);
        crossChainFork = vm.createFork(CROSS_CHAIN_RPC_URL);

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

        vm.selectFork(crossChainFork);
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

        // prepare oracle chain

        vm.selectFork(oracleChainFork);
        // TODO do proper deployments of relayer
        oracleChainRelayer = makeAddr("oracleChainRelayer");
        coordinator = new OracleCoordinator(
            owner,
            address(oracleChainCCIPBnMToken)
        );
        oracleChainRequestFactory = new RequestFactory(
            address(oracleChainCCIPBnMToken),
            address(coordinator),
            true
        );

        // grant roles on coordinator (finalizer and factory)
        vm.startPrank(owner);
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
        // TODO do proper deployments of relayer
        crossChainRelayer = makeAddr("crossChainRelayer");
        crossChainRequestFactory = new RequestFactory(
            address(crossChainCCIPBnMToken),
            crossChainRelayer,
            false
        );

        // computeCreate2Address(bytes32 salt, bytes32 initCodeHash, address deployer)
        // address oracleAddress = vm.computeCreate2Address(keccak256("best dev ever"),OracleCoordinator,owner );

        // deploy on cross chain
    }

    function test_setUp_Successful() public pure {
        assertTrue(true, "setUp expected to be successful");
    }
}
