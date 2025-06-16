// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.24;

import "./BaseScript.sol";

import {IAccessControl} from "@openzeppelin/contracts/access/IAccessControl.sol";
import {OracleCoordinator} from "../src/OracleCoordinator.sol";
import {RequestContract} from "../src/RequestContract.sol";
import {RequestFactory} from "../src/RequestFactory.sol";
import {OracleRelayer} from "../src/OracleRelayer.sol";

contract Deploy is BaseScript {
    function run() external {
        string memory oracleChainRPC = vm.envString("AVALANCHE_FUJI_RPC_URL");
        address usdc = vm.envAddress("AVALANCHE_FUJI_UTILITY_TOKEN_ADDRESS");
        address platform = vm.envAddress("AVALANCHE_FUJI_PLATFORM_ADDRESS");

        // === Main Oracle Chain Deployment ===
        vm.createSelectFork(oracleChainRPC);
        uint256 oracleChainId = block.chainid;

        vm.startBroadcast();

        OracleRelayer relayerInstance = _deployOracleRelayer(
            oracleChainId,
            address(0), // link token
            address(0) // ccip router
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
            true
        );

        bytes32 _role = oracleInstance.FACTORY_ROLE();
        if (
            !IAccessControl(oracleInstance).hasRole(
                _role,
                address(mainFactoryInstance)
            )
        ) {
            IAccessControl(oracleInstance).grantRole(
                _role,
                address(mainFactoryInstance)
            );
        }

        // address oracleRelayer = address(0xDEAD);

        // === Sidechain Deployment ===
        //  _deploySidechain(vm.envString("ETHEREUM_SEPOLIA_RPC_URL"),vm.envAddress("ETHEREUM_SEPOLIA_UTILITY_TOKEN_ADDRESS"), oracleRelayer);
        //  _deploySidechain(vm.envString("ARBITRUM_SEPOLIA_RPC_URL"),vm.envAddress("ARBITRUM_SEPOLIA_UTILITY_TOKEN_ADDRESS"), oracleRelayer);
        //  _deploySidechain(vm.envString("BASE_SEPOLIA_RPC_URL"),vm.envAddress("BASE_SEPOLIA_UTILITY_TOKEN_ADDRESS"), oracleRelayer);

        // TODO finish deployment with valid oracle

        vm.stopBroadcast();
    }

    function _deploySidechain(
        string memory rpcUrl,
        address usdc,
        address relayer,
        address homeChain
    ) internal {
        vm.createSelectFork(rpcUrl);
        uint256 chainId = block.chainid;

        bytes memory factoryArgs = abi.encode(usdc, relayer, false);
        bytes memory factoryCode = type(RequestFactory).creationCode;

        vm.startBroadcast();

        if (
            !_shouldDeploy(chainId, "RequestFactory", factoryArgs, factoryCode)
        ) {
            RequestFactory factory = new RequestFactory(
                usdc,
                relayer,
                homeChain,
                false
            );
            _writeDeploymentJson(
                chainId,
                "RequestFactory",
                address(factory),
                factoryArgs,
                factoryCode
            );
        }

        vm.stopBroadcast();
    }

    function _deployOracleRelayer(
        uint256 _chainId,
        address _linkToken,
        address _router
    ) public returns (OracleRelayer _instance) {
        bytes memory relayerArgs = abi.encode(_linkToken, _router);
        bytes memory relayerCode = type(OracleRelayer).creationCode;
        if (
            _shouldDeploy(_chainId, "OracleRelayer", relayerArgs, relayerCode)
        ) {
            OracleRelayer relayer = new OracleRelayer(_linkToken, _router);
            _writeDeploymentJson(
                _chainId,
                "OracleRelayer",
                address(relayer),
                relayerArgs,
                relayerCode
            );
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
            OracleCoordinator oracle = new OracleCoordinator(
                _platform,
                _relayer,
                _usdc
            );
            _writeDeploymentJson(
                _chainId,
                "OracleCoordinator",
                address(oracle),
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
        bool _isOracleChain
    ) public returns (RequestFactory _instance) {
        bytes memory _args = abi.encode(_usdc, _oracle, _isOracleChain);
        bytes memory _code = type(RequestFactory).creationCode;

        if (_shouldDeploy(_chainId, "RequestFactory", _args, _code)) {
            RequestFactory mainFactory = new RequestFactory(
                _usdc,
                _oracle,
                address(0),
                _isOracleChain
            );

            _writeDeploymentJson(
                _chainId,
                "RequestFactory",
                address(mainFactory),
                _args,
                _code
            );
            _writeDeploymentJson(
                _chainId,
                "RequestContract",
                mainFactory.implementation(),
                abi.encode(
                    address(mainFactory),
                    _usdc,
                    _oracle,
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
