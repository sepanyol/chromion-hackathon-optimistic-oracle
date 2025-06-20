// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.24;

import "./BaseScript.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IRequestFactory, RequestTypes} from "../src/interfaces/IRequestFactory.sol";

contract CreateRequestOnBase is BaseScript {
    function run() public {
        string memory originChain = vm.envString("BASE_SEPOLIA_RPC_URL");
        address usdc = vm.envAddress("BASE_SEPOLIA_UTILITY_TOKEN_ADDRESS");
        // address platform = vm.envAddress("AVALANCHE_FUJI_PLATFORM_ADDRESS");
        // address linkToken = vm.envAddress("BASE_SEPOLIA_LINK");
        // address ccipRouter = vm.envAddress("BASE_SEPOLIA_CCIP_ROUTER");
        // uint64 chainSelector = uint64(
        //     vm.envUint("BASE_SEPOLIA_CCIP_CHAIN_SELECTOR")
        // );

        vm.createSelectFork(originChain);
        uint256 chainId = block.chainid;

        vm.startBroadcast();
        (, address _deployer, ) = vm.readCallers();

        address factory = _readAddress(chainId, "RequestFactory");

        IERC20(usdc).approve(factory, 1e8);
        address originChainRequestId = IRequestFactory(factory).createRequest(
            RequestTypes.RequestParams({
                requester: abi.encode(_deployer),
                originAddress: abi.encode(""),
                originChainId: abi.encode(""),
                answerType: RequestTypes.AnswerType.Bool,
                challengeWindow: 3600,
                rewardAmount: 1e8,
                question: "Is 'Marshall Bruce Mathers III' the real name of Eminem?",
                context: "You can look at https://en.wikipedia.org/wiki/Eminem to see a good amount of information to this artist.",
                truthMeaning: "",
                isCrossChain: true
            })
        );

        console.log(originChainRequestId);

        vm.stopBroadcast();
    }
}
