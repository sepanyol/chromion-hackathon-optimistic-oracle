// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.24;

import "./BaseScript.sol";
import {IOracleCoordinator} from "./../src/interfaces/IOracleCoordinator.sol";
import {IAccessControl} from "@openzeppelin/contracts/access/IAccessControl.sol";

contract SetupFinalizer is BaseScript {
    // address public constant _finalizer =
    //     0xD48c85c277A3aD786dcCd3902873342cAaEC376f;
    // address public constant _finalizerPrev =
    //     0x2b37463D918710392e16cfFd07A70979B0D142B5;
    address public constant _finalizer =
        0x788243f8B67CDC2f51B3bC223Cb4799843ba740b;
    address public constant _finalizerPrev =
        0xD48c85c277A3aD786dcCd3902873342cAaEC376f;

    function run() public {
        string memory oracleChainRPC = vm.envString("AVALANCHE_FUJI_RPC_URL");
        vm.createSelectFork(oracleChainRPC);

        IOracleCoordinator oracle = IOracleCoordinator(
            _readAddress(block.chainid, "OracleCoordinator")
        );

        bytes32 _role = oracle.FACTORY_ROLE();
        vm.startBroadcast(vm.envUint("PRIVATE_KEY"));
        IAccessControl(address(oracle)).grantRole(_role, _finalizer);
        IAccessControl(address(oracle)).revokeRole(_role, _finalizerPrev);
        vm.stopBroadcast();
    }
}
