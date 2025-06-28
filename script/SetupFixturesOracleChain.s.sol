// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.24;

import "./BaseScript.sol";

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IOracleCoordinator} from "../src/interfaces/IOracleCoordinator.sol";
import {IRequestFactory} from "../src/interfaces/IRequestFactory.sol";
import {RequestTypes} from "../src/types/RequestTypes.sol";

contract SetupFixturesOracleChain is BaseScript {
    uint256 public constant REWARD_AMOUNT = 5e6;
    IOracleCoordinator oracle;
    IRequestFactory factory;
    IERC20 usdc;

    RequestTypes.RequestParams defaultRequestParams =
        RequestTypes.RequestParams({
            requester: abi.encode(address(0)),
            answerType: RequestTypes.AnswerType.Bool,
            challengeWindow: 600,
            rewardAmount: 5e6,
            question: "Question",
            context: "Context",
            truthMeaning: "Truth meaning",
            originChainId: bytes(""),
            originAddress: bytes(""),
            isCrossChain: false
        });

    function setUp() public {}

    function run() public {
        string memory oracleChainRPC = vm.envString("AVALANCHE_FUJI_RPC_URL");

        vm.createSelectFork(oracleChainRPC);

        usdc = IERC20(vm.envAddress("AVALANCHE_FUJI_UTILITY_TOKEN_ADDRESS"));
        oracle = IOracleCoordinator(
            _readAddress(block.chainid, "OracleCoordinator")
        );
        factory = IRequestFactory(
            _readAddress(block.chainid, "RequestFactory")
        );

        setUpFixtures_localfork();
    }

    function setUpFixtures_localfork() public {
        fixtures_Prepare();
        // fixtures_Open();
        // fixtures_Proposed();
        // fixtures_Challenged();
        // fixtures_ChallengedReviewFor();
        // fixtures_ChallengedReviewAgainst();
    }

    function fixtures_Prepare() public {
        uint256[] memory _accounts = new uint256[](7);
        _accounts[0] = vm.envUint("PRIVATE_KEY_PROPOSER");
        _accounts[1] = vm.envUint("PRIVATE_KEY_CHALLENGER");
        _accounts[2] = vm.envUint("PRIVATE_KEY_REVIEWER_1");
        _accounts[3] = vm.envUint("PRIVATE_KEY_REVIEWER_2");
        _accounts[4] = vm.envUint("PRIVATE_KEY_REVIEWER_3");
        _accounts[5] = vm.envUint("PRIVATE_KEY_REVIEWER_4");
        _accounts[6] = vm.envUint("PRIVATE_KEY_REVIEWER_5");

        // fund accounts
        uint256 MIN_VALUE_FUNDS = 1e16;
        uint256 MIN_VALUE_TOKENS = 1e15;
        for (uint256 i = 0; i < _accounts.length; i++) {
            address _account = vm.addr(_accounts[i]);

            // funds
            uint256 _balance = _account.balance;
            if (MIN_VALUE_FUNDS / 2 > _account.balance) {
                uint256 _fillWith = MIN_VALUE_FUNDS - _balance;

                // from deployer
                vm.broadcast(vm.envUint("PRIVATE_KEY"));
                payable(_account).transfer(_fillWith);

                console.log(
                    string.concat(
                        "Sent ",
                        vm.toString(_fillWith),
                        "wei to account ",
                        vm.toString(_account)
                    )
                );
            }

            // tokens
            uint256 _balanceTokens = usdc.balanceOf(_account);
            if (MIN_VALUE_TOKENS / 2 > _balanceTokens) {
                uint256 _fillWith = MIN_VALUE_TOKENS - _balanceTokens;
                vm.broadcast(vm.envUint("PRIVATE_KEY"));
                usdc.transfer(_account, _fillWith);
            }

            vm.broadcast(_accounts[i]);
            usdc.approve(address(oracle), MIN_VALUE_TOKENS);

            vm.broadcast(_accounts[i]);
            usdc.approve(address(factory), MIN_VALUE_TOKENS);
        }
    }

    function fixtures_Open() public {
        vm.startBroadcast(vm.envUint("PRIVATE_KEY"));
        (, address _requester, ) = vm.readCallers();

        usdc.approve(address(factory), 100e6);

        RequestTypes.RequestParams memory _params = defaultRequestParams;
        _params.requester = abi.encode(_requester);
        address createdRequest = factory.createRequest(_params);
        console.log(
            string.concat(
                "Request created | status open | ",
                vm.toString(createdRequest)
            )
        );
        vm.stopBroadcast();
    }

    function fixtures_Proposed() public {
        vm.startBroadcast(vm.envUint("PRIVATE_KEY"));
        (, address _requester, ) = vm.readCallers();

        RequestTypes.RequestParams memory _params = defaultRequestParams;
        _params.requester = abi.encode(_requester);
        address createdRequest = factory.createRequest(_params);
        console.log(
            string.concat(
                "Request created | status open | ",
                vm.toString(createdRequest)
            )
        );
        vm.stopBroadcast();

        vm.broadcast(vm.envUint("PRIVATE_KEY_PROPOSER"));
        oracle.proposeAnswer(createdRequest, abi.encode(true));
    }

    function fixtures_Challenged() public {
        vm.startBroadcast(vm.envUint("PRIVATE_KEY"));
        (, address _requester, ) = vm.readCallers();

        RequestTypes.RequestParams memory _params = defaultRequestParams;
        _params.requester = abi.encode(_requester);
        address createdRequest = factory.createRequest(_params);
        console.log(
            string.concat(
                "Request created | status open | ",
                vm.toString(createdRequest)
            )
        );
        vm.stopBroadcast();

        vm.broadcast(vm.envUint("PRIVATE_KEY_PROPOSER"));
        oracle.proposeAnswer(createdRequest, abi.encode(true));

        vm.broadcast(vm.envUint("PRIVATE_KEY_CHALLENGER"));
        oracle.challengeAnswer(
            createdRequest,
            false,
            abi.encode(false),
            abi.encode("because of yada yada yada")
        );
    }

    function fixtures_ChallengedReviewFor() public {
        vm.startBroadcast(vm.envUint("PRIVATE_KEY"));
        (, address _requester, ) = vm.readCallers();

        RequestTypes.RequestParams memory _params = defaultRequestParams;
        _params.requester = abi.encode(_requester);
        address createdRequest = factory.createRequest(_params);
        console.log(
            string.concat(
                "Request created | status open | ",
                vm.toString(createdRequest)
            )
        );
        vm.stopBroadcast();

        vm.broadcast(vm.envUint("PRIVATE_KEY_PROPOSER"));
        oracle.proposeAnswer(createdRequest, abi.encode(true));

        vm.broadcast(vm.envUint("PRIVATE_KEY_CHALLENGER"));
        oracle.challengeAnswer(
            createdRequest,
            false,
            abi.encode(false),
            abi.encode("because of yada yada yada")
        );

        vm.broadcast(vm.envUint("PRIVATE_KEY_REVIEWER_1"));
        oracle.submitReview(
            createdRequest,
            abi.encode("because of yada yada yada"),
            true
        );
    }

    function fixtures_ChallengedReviewAgainst() public {
        vm.startBroadcast(vm.envUint("PRIVATE_KEY"));
        (, address _requester, ) = vm.readCallers();

        RequestTypes.RequestParams memory _params = defaultRequestParams;
        _params.requester = abi.encode(_requester);
        address createdRequest = factory.createRequest(_params);
        console.log(
            string.concat(
                "Request created | status open | ",
                vm.toString(createdRequest)
            )
        );
        vm.stopBroadcast();

        vm.broadcast(vm.envUint("PRIVATE_KEY_PROPOSER"));
        oracle.proposeAnswer(createdRequest, abi.encode(true));

        vm.broadcast(vm.envUint("PRIVATE_KEY_CHALLENGER"));
        oracle.challengeAnswer(
            createdRequest,
            false,
            abi.encode(false),
            abi.encode("because of yada yada yada")
        );

        vm.broadcast(vm.envUint("PRIVATE_KEY_REVIEWER_1"));
        oracle.submitReview(
            createdRequest,
            abi.encode("because of yada yada yada"),
            false
        );
    }
}
