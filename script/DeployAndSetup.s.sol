// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.24;

import "./BaseScript.sol";
import "./Deploy.s.sol";
import "./SetupFixturesOracleChain.s.sol";

contract DeployAndSetup is BaseScript {
    function run() public {
        Deploy _deploy = new Deploy();
        SetupFixturesOracleChain _setupFixturesOracleChain = new SetupFixturesOracleChain();

        _deploy.run();
        _setupFixturesOracleChain.run();
    }
}
