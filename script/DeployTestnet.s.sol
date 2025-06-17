// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.24;

import "./BaseScript.sol";

import {IAccessControl} from "@openzeppelin/contracts/access/IAccessControl.sol";
import {OracleCoordinator} from "../src/OracleCoordinator.sol";
import {RequestContract} from "../src/RequestContract.sol";
import {RequestFactory} from "../src/RequestFactory.sol";
import {OracleRelayer, IERC20} from "../src/OracleRelayer.sol";

struct SideChainsData {
    string rpcUrl;
    address usdc;
    address linkToken;
    address ccipRouter;
    uint64 chainSelector;
}

contract DeployTestnet is BaseScript {
    SideChainsData[] sideChainData;

    function setUp() public {
        // Ethereum Sepolia
        sideChainData.push(
            SideChainsData({
                rpcUrl: vm.envString("ETHEREUM_SEPOLIA_RPC_URL"),
                usdc: vm.envAddress("ETHEREUM_SEPOLIA_UTILITY_TOKEN_ADDRESS"),
                linkToken: vm.envAddress("ETHEREUM_SEPOLIA_LINK"),
                ccipRouter: vm.envAddress("ETHEREUM_SEPOLIA_CCIP_ROUTER"),
                chainSelector: uint64(
                    vm.envUint("ETHEREUM_SEPOLIA_CCIP_CHAIN_SELECTOR")
                )
            })
        );

        // Arbitrum Sepolia
        sideChainData.push(
            SideChainsData({
                rpcUrl: vm.envString("ARBITRUM_SEPOLIA_RPC_URL"),
                usdc: vm.envAddress("ARBITRUM_SEPOLIA_UTILITY_TOKEN_ADDRESS"),
                linkToken: vm.envAddress("ARBITRUM_SEPOLIA_LINK"),
                ccipRouter: vm.envAddress("ARBITRUM_SEPOLIA_CCIP_ROUTER"),
                chainSelector: uint64(
                    vm.envUint("ARBITRUM_SEPOLIA_CCIP_CHAIN_SELECTOR")
                )
            })
        );

        // Base Sepolia
        sideChainData.push(
            SideChainsData({
                rpcUrl: vm.envString("BASE_SEPOLIA_RPC_URL"),
                usdc: vm.envAddress("BASE_SEPOLIA_UTILITY_TOKEN_ADDRESS"),
                linkToken: vm.envAddress("BASE_SEPOLIA_LINK"),
                ccipRouter: vm.envAddress("BASE_SEPOLIA_CCIP_ROUTER"),
                chainSelector: uint64(
                    vm.envUint("BASE_SEPOLIA_CCIP_CHAIN_SELECTOR")
                )
            })
        );
    }

    function run() external {
        string memory oracleChainRPC = vm.envString("AVALANCHE_FUJI_RPC_URL");
        address usdc = vm.envAddress("AVALANCHE_FUJI_UTILITY_TOKEN_ADDRESS");
        address platform = vm.envAddress("AVALANCHE_FUJI_PLATFORM_ADDRESS");
        address linkToken = vm.envAddress("AVALANCHE_FUJI_LINK");
        address ccipRouter = vm.envAddress("AVALANCHE_FUJI_CCIP_ROUTER");

        uint64 oracleChainSelector = uint64(
            vm.envUint("AVALANCHE_FUJI_CCIP_CHAIN_SELECTOR")
        );

        // === Main Oracle Chain Deployment ===
        uint256 oracleForkId = vm.createSelectFork(oracleChainRPC);
        uint256 oracleChainId = block.chainid;

        vm.startBroadcast();

        // ------------------------------------------------------------
        // Deploy Oracle Chain
        // ------------------------------------------------------------
        OracleRelayer relayerInstance = _deployOracleRelayer(
            oracleChainId,
            linkToken,
            ccipRouter
        );

        OracleCoordinator oracleInstance = _deployOracleCoordinator(
            oracleChainId,
            platform,
            address(relayerInstance),
            usdc
        );

        RequestFactory mainFactoryInstance = _deployRequestFactory(
            oracleChainId,
            usdc,
            address(oracleInstance),
            address(0),
            0,
            true
        );

        // ------------------------------------------------------------
        // Setup Oracle Chain
        // ------------------------------------------------------------
        relayerInstance.addSenders(address(oracleInstance));

        // grant factory role
        bytes32 _factoryRole = oracleInstance.FACTORY_ROLE();
        if (
            !IAccessControl(oracleInstance).hasRole(
                _factoryRole,
                address(mainFactoryInstance)
            )
        ) {
            IAccessControl(oracleInstance).grantRole(
                _factoryRole,
                address(mainFactoryInstance)
            );
        }
        vm.stopBroadcast();

        // ------------------------------------------------------------
        // Deploy Cross Chains
        // ------------------------------------------------------------
        uint256 _sideChainLength = sideChainData.length;
        for (uint256 i = 0; i < _sideChainLength; i++) {
            // switches  chain
            (
                uint256 _chainId,
                RequestFactory _factory,
                OracleRelayer _relayer
            ) = _deploySidechain(
                    sideChainData[i].rpcUrl,
                    sideChainData[i].usdc,
                    sideChainData[i].linkToken,
                    sideChainData[i].ccipRouter,
                    address(mainFactoryInstance),
                    oracleChainId
                );

            vm.startBroadcast();
            bytes memory _destinationRelayerBytes = _relayer
                .allowedDestinationRelayers(oracleChainSelector);

            // remove existing relayer if one is set
            if (
                _destinationRelayerBytes.length > 0 &&
                abi.decode(_destinationRelayerBytes, (address)) !=
                address(relayerInstance)
            ) _relayer.removeDestinationRelayer(block.chainid);

            _relayer.addDestinationRelayer(
                oracleChainId,
                oracleChainSelector,
                address(relayerInstance)
            );

            // cross chain factory is allows to send through cross chain relayer
            _relayer.addSenders(address(_factory));
            vm.stopBroadcast();

            // configure oracle chain
            vm.selectFork(oracleForkId);
            vm.startBroadcast();
            relayerInstance.addDestinationRelayer(
                _chainId,
                sideChainData[i].chainSelector,
                address(_relayer)
            );
            vm.stopBroadcast();
        }

        console.log("TODO: Automate Upkeep Registration");
        console.log("TODO: Purge Existing Upkeeps LINK");
        console.log("-- until then, use SetupFinalizer.s.sol");

        // {
        //     // TODO move to SetupFinalizer Script
        //     // grant finalizer role
        //     bytes32 _role = oracleInstance.FINALIZER_ROLE();
        //     if (
        //         !IAccessControl(oracleInstance).hasRole(
        //             _role,
        //             address(mainFactoryInstance)
        //         )
        //     ) {
        //         IAccessControl(oracleInstance).grantRole(
        //             _role,
        //             address(mainFactoryInstance)
        //         );
        //     }
        // }
    }

    function _deploySidechain(
        string memory rpcUrl,
        address usdc,
        address linkToken,
        address ccipRouter,
        address homeChainFactory,
        uint256 homeChainId
    )
        internal
        returns (
            uint256 _chainId,
            RequestFactory _factory,
            OracleRelayer _relayer
        )
    {
        vm.createSelectFork(rpcUrl);
        _chainId = block.chainid;
        vm.startBroadcast();
        _relayer = _deployOracleRelayer(_chainId, linkToken, ccipRouter);
        _factory = _deployRequestFactory(
            _chainId,
            usdc,
            address(_relayer),
            homeChainFactory,
            homeChainId,
            false
        );
        vm.stopBroadcast();
    }

    function _deployOracleRelayer(
        uint256 _chainId,
        address _linkToken,
        address _router
    ) public returns (OracleRelayer _instance) {
        bytes memory _args = abi.encode(_linkToken, _router);
        bytes memory _code = type(OracleRelayer).creationCode;
        if (_shouldDeploy(_chainId, "OracleRelayer", _args, _code)) {
            // is there old relayer?
            _instance = OracleRelayer(
                payable(readAddress(_chainId, "OracleRelayer"))
            );

            if (address(_instance) != address(0))
                if (IERC20(_linkToken).balanceOf(address(_instance)) > 0)
                    _instance.recoverAsset(_linkToken);

            _instance = new OracleRelayer(_linkToken, _router);
            _writeDeploymentJson(
                _chainId,
                "OracleRelayer",
                address(_instance),
                _args,
                _code
            );

            // send link to new relayer
            vm.stopBroadcast();
            address _deployer = vm.addr(vm.envUint("PRIVATE_KEY"));
            // pump LINK balance
            if (IERC20(_linkToken).balanceOf(address(_instance)) <= 1e18) {
                if (IERC20(_linkToken).balanceOf(_deployer) > 0) {
                    vm.broadcast(vm.envUint("PRIVATE_KEY"));
                    IERC20(_linkToken).transfer(address(_instance), 5e18);
                } else {
                    console.log("Insufficient LINK balance on deployer wallet");
                }
            }
            vm.startBroadcast();
        }

        _instance = OracleRelayer(
            payable(readAddress(_chainId, "OracleRelayer"))
        );
    }

    function _deployOracleCoordinator(
        uint256 _chainId,
        address _platform,
        address _relayer,
        address _usdc
    ) public returns (OracleCoordinator _instance) {
        bytes memory _args = abi.encode(_platform, _relayer, _usdc);
        bytes memory _code = type(OracleCoordinator).creationCode;
        if (_shouldDeploy(_chainId, "OracleCoordinator", _args, _code)) {
            _instance = new OracleCoordinator(_platform, _relayer, _usdc);
            _writeDeploymentJson(
                _chainId,
                "OracleCoordinator",
                address(_instance),
                _args,
                _code
            );
        }
        _instance = OracleCoordinator(
            readAddress(_chainId, "OracleCoordinator")
        );
    }

    function _deployRequestFactory(
        uint256 _chainId,
        address _usdc,
        address _oracle,
        address _homeFactory,
        uint256 _homeChainId,
        bool _isOracleChain
    ) public returns (RequestFactory _instance) {
        bytes memory _args = abi.encode(
            _usdc,
            _oracle,
            _homeFactory,
            _homeChainId,
            _isOracleChain
        );
        bytes memory _code = type(RequestFactory).creationCode;
        if (_shouldDeploy(_chainId, "RequestFactory", _args, _code)) {
            _instance = new RequestFactory(
                _usdc,
                _oracle,
                _homeFactory,
                _homeChainId,
                _isOracleChain
            );
            _writeDeploymentJson(
                _chainId,
                "RequestFactory",
                address(_instance),
                _args,
                _code
            );
            _writeDeploymentJson(
                _chainId,
                "RequestContract",
                _instance.implementation(),
                abi.encode(
                    address(_instance),
                    _usdc,
                    _oracle,
                    _homeFactory,
                    _homeChainId,
                    _isOracleChain
                ),
                type(RequestContract).creationCode
            );
        }
        _instance = RequestFactory(readAddress(_chainId, "RequestFactory"));
    }

    function _shouldDeploy(
        uint256 chainId,
        string memory contractName,
        bytes memory newArgs,
        bytes memory creationCode
    ) internal view returns (bool) {
        string memory path = string.concat(
            "deployments/",
            vm.toString(chainId),
            "/",
            contractName,
            ".json"
        );

        if (!vm.exists(path)) return true;

        string memory json = vm.readFile(path);

        bytes memory oldArgsHex = vm.parseJsonBytes(json, ".constructorArgs");
        bytes memory oldCodeHash = abi.encodePacked(
            vm.parseJsonBytes32(json, ".codeHash")
        );

        return
            keccak256(oldArgsHex) != keccak256(newArgs) ||
            keccak256(oldCodeHash) !=
            keccak256(abi.encodePacked(keccak256(creationCode)));
    }

    function _writeDeploymentJson(
        uint256 chainId,
        string memory contractName,
        address deployed,
        bytes memory constructorArgs,
        bytes memory creationCode
    ) internal {
        string memory _path = string.concat(
            "deployments/",
            vm.toString(chainId)
        );

        if (!vm.exists(_path)) vm.createDir(_path, true);

        string memory outputJson = "output";

        vm.serializeString(outputJson, "address", vm.toString(deployed));

        vm.serializeBytes(outputJson, "constructorArgs", constructorArgs);

        vm.serializeBytes(
            outputJson,
            "codeHash",
            abi.encodePacked(keccak256(creationCode))
        );

        string memory finalJson = vm.serializeUint(
            outputJson,
            "chainId",
            chainId
        );

        vm.writeFile(
            string.concat(_path, "/", contractName, ".json"),
            finalJson
        );
    }

    function _toHex(bytes memory data) internal pure returns (string memory) {
        bytes memory hexChars = "0123456789abcdef";
        bytes memory str = new bytes(2 + data.length * 2);
        str[0] = "0";
        str[1] = "x";
        for (uint256 i = 0; i < data.length; i++) {
            str[2 + i * 2] = hexChars[uint8(data[i] >> 4)];
            str[3 + i * 2] = hexChars[uint8(data[i] & 0x0f)];
        }
        return string(str);
    }
}
