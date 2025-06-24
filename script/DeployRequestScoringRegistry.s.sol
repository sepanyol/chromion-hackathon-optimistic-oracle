// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.24;

import "./BaseScript.sol";
import {RequestScoringRegistry} from "./../src/RequestScoringRegistry.sol";

contract DeployRequestScoringRegistry is BaseScript {
    function run() public {
        string memory oracleChainRPC = vm.envString("AVALANCHE_FUJI_RPC_URL");

        vm.createSelectFork(oracleChainRPC);
        vm.startBroadcast();

        RequestScoringRegistry _instance;
        bytes memory _args = abi.encode();
        bytes memory _code = type(RequestScoringRegistry).creationCode;
        if (
            _shouldDeploy(block.chainid, "RequestScoringRegistry", _args, _code)
        ) {
            // is there old relayer?
            _instance = new RequestScoringRegistry();
            _writeDeploymentJson(
                block.chainid,
                "RequestScoringRegistry",
                address(_instance),
                _args,
                _code
            );
        }

        _instance = RequestScoringRegistry(
            _readAddress(block.chainid, "RequestScoringRegistry")
        );
        vm.stopBroadcast();
    }
}
