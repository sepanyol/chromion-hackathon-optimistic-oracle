// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.24;

import "forge-std/Script.sol";

abstract contract BaseScript is Script {
    using stdJson for string;

    function _readAddress(
        uint256 chainId,
        string memory contractName
    ) internal view returns (address) {
        string memory path = string.concat(
            "deployments/",
            vm.toString(chainId),
            "/",
            contractName,
            ".json"
        );
        if (vm.exists(path))
            return
                vm.parseAddress(
                    vm.parseJsonString(vm.readFile(path), ".address")
                );
        return address(0);
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
}
