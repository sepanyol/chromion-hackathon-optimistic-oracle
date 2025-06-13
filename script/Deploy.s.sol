// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.24;

import "./BaseScript.sol";

import {IAccessControl} from "@openzeppelin/contracts/access/IAccessControl.sol";
import {OracleCoordinator} from "../src/OracleCoordinator.sol";
import {RequestContract} from "../src/RequestContract.sol";
import {RequestFactory} from "../src/RequestFactory.sol";

contract Deploy is BaseScript {
    function run() external {
        string memory oracleChainRPC = vm.envString("AVALANCHE_FUJI_RPC_URL");
        address usdc = vm.envAddress("AVALANCHE_FUJI_UTILITY_TOKEN_ADDRESS");
        address platform = vm.envAddress("AVALANCHE_FUJI_PLATFORM_ADDRESS");

        // === Main Oracle Chain Deployment ===
        vm.createSelectFork(oracleChainRPC);
        uint256 oracleChainId = block.chainid;

        vm.startBroadcast();

        bytes memory oracleArgs = abi.encode(platform, usdc);
        bytes memory oracleCode = type(OracleCoordinator).creationCode;

        if (
            _shouldDeploy(
                oracleChainId,
                "OracleCoordinator",
                oracleArgs,
                oracleCode
            )
        ) {
            OracleCoordinator oracle = new OracleCoordinator(platform, usdc);
            _writeDeploymentJson(
                oracleChainId,
                "OracleCoordinator",
                address(oracle),
                oracleArgs,
                oracleCode
            );
        }

        OracleCoordinator oracleInstance = OracleCoordinator(
            readAddress(oracleChainId, "OracleCoordinator")
        );

        bytes memory factoryArgs = abi.encode(
            usdc,
            address(oracleInstance),
            true
        );
        bytes memory factoryCode = type(RequestFactory).creationCode;

        if (
            _shouldDeploy(
                oracleChainId,
                "RequestFactory",
                factoryArgs,
                factoryCode
            )
        ) {
            RequestFactory mainFactory = new RequestFactory(
                usdc,
                address(oracleInstance),
                true
            );

            _writeDeploymentJson(
                oracleChainId,
                "RequestFactory",
                address(mainFactory),
                factoryArgs,
                factoryCode
            );
            _writeDeploymentJson(
                oracleChainId,
                "RequestContract",
                mainFactory.implementation(),
                abi.encode(
                    address(mainFactory),
                    usdc,
                    address(oracleInstance),
                    true
                ),
                type(RequestContract).creationCode
            );
        }

        RequestFactory mainFactoryInstance = RequestFactory(
            readAddress(oracleChainId, "RequestFactory")
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
        address relayer
    ) internal {
        vm.createSelectFork(rpcUrl);
        uint256 chainId = block.chainid;

        bytes memory factoryArgs = abi.encode(usdc, relayer, false);
        bytes memory factoryCode = type(RequestFactory).creationCode;

        vm.startBroadcast();

        if (
            !_shouldDeploy(chainId, "RequestFactory", factoryArgs, factoryCode)
        ) {
            RequestFactory factory = new RequestFactory(usdc, relayer, false);
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
