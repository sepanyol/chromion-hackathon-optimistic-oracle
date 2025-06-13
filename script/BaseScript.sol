// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.24;

import "forge-std/Script.sol";

abstract contract BaseScript is Script {
    using stdJson for string;

    function readAddress(
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
}
