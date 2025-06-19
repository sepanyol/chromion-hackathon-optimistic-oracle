// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.24;

import "forge-std/Test.sol";
import "forge-std/StdCheats.sol";

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import {MockUSDC} from "../src/mocks/MockUSDC.sol";
import {MockOracleCoordinator} from "../src/mocks/MockOracleCoordinator.sol";
import {RequestContract} from "../src/RequestContract.sol";
import {RequestTypes} from "../src/types/RequestTypes.sol";
import {RequestFactory} from "../src/RequestFactory.sol";
import {IBaseRequestContract} from "../src/interfaces/IBaseRequestContract.sol";
import {IOracleCoordinator} from "../src/interfaces/IOracleCoordinator.sol";
import {IRequestFactory} from "../src/interfaces/IRequestFactory.sol";
import {IOracleRelayer} from "../src/interfaces/IOracleRelayer.sol";

contract RequestFactoryTest is Test {
    RequestFactory public factory;
    RequestFactory public factoryCrossChain;
    MockUSDC public usdc;
    address public oracleCoordinator;
    address public oracleRelayer = address(0xC1);
    address public requester = address(0xA0);

    function setUp() public {
        usdc = new MockUSDC();
        usdc.mint(requester, 1000e6);

        oracleCoordinator = address(new MockOracleCoordinator());

        vm.prank(requester);
        usdc.approve(address(this), type(uint256).max);

        factory = new RequestFactory(
            address(usdc),
            oracleCoordinator,
            address(0),
            0,
            true
        );
        factoryCrossChain = new RequestFactory(
            address(usdc),
            oracleRelayer,
            address(factory),
            1,
            false
        );

        usdc.approve(address(factory), type(uint256).max);
        usdc.approve(address(factoryCrossChain), type(uint256).max);
    }

    function test_createRequest_Successful() public {
        RequestTypes.RequestParams memory p = RequestTypes.RequestParams({
            requester: abi.encodePacked(address(this)),
            answerType: RequestTypes.AnswerType.Bool,
            challengeWindow: 86400,
            rewardAmount: 100e6,
            question: "Is the sky blue?",
            context: "Weather report",
            truthMeaning: "True means sky is blue",
            originChainId: bytes(""),
            originAddress: bytes(""),
            isCrossChain: false
        });

        vm.expectEmit(true, true, false, false);
        emit MockOracleCoordinator.registerRequestEmit();

        vm.expectEmit(false, false, false, false);
        emit RequestFactory.RequestCreated(address(0), p);

        address created = factory.createRequest(p);
        assertTrue(created != address(0), "Clone address should not be zero");
    }

    function test_createRequest_SuccessfulFromCrossChainOnOracleChain() public {
        bytes memory originAddress = abi.encode(address(0x1234));
        bytes memory originChainId = abi.encode(1234);
        RequestTypes.RequestParams memory p = RequestTypes.RequestParams({
            requester: abi.encodePacked(address(this)),
            answerType: RequestTypes.AnswerType.Bool,
            challengeWindow: 86400,
            rewardAmount: 100e6,
            question: "Is the sky blue?",
            context: "Weather report",
            truthMeaning: "True means sky is blue",
            originAddress: originAddress,
            originChainId: originChainId,
            isCrossChain: true
        });

        vm.expectEmit(true, true, false, false);
        emit MockOracleCoordinator.registerRequestEmit();

        vm.expectEmit(false, false, false, false);
        emit RequestFactory.RequestCreated(address(0), p);

        address created = factory.createRequest(p);
        assertTrue(created != address(0), "Clone address should not be zero");

        assertEq(
            originAddress,
            IBaseRequestContract(created).originAddress(),
            "origin address should be set correctly"
        );
        assertEq(
            originChainId,
            IBaseRequestContract(created).originChainId(),
            "origin chainid should be set correctly"
        );
    }

    function test_createRequest_FromCrossChainToOracleChain() public {
        RequestTypes.RequestParams memory p = RequestTypes.RequestParams({
            requester: abi.encodePacked(address(this)),
            answerType: RequestTypes.AnswerType.Bool,
            challengeWindow: 86400,
            rewardAmount: 100e6,
            question: "Is the sky blue?",
            context: "Weather report",
            truthMeaning: "True means sky is blue",
            originAddress: bytes(""),
            originChainId: bytes(""),
            isCrossChain: true
        });

        vm.mockCall(
            oracleRelayer,
            abi.encodeWithSelector(
                IOracleRelayer.chainIdToChainSelector.selector,
                block.chainid
            ),
            abi.encode(1337)
        );

        vm.mockCall(
            oracleRelayer,
            abi.encodeWithSelector(
                IOracleRelayer.sendMessageWithToken.selector
            ),
            abi.encode(bytes32(keccak256("testid")))
        );

        vm.expectEmit(false, false, false, false);
        emit RequestFactory.RequestCreated(address(0), p);

        address created = factoryCrossChain.createRequest(p);
        assertTrue(created != address(0), "Clone address should not be zero");
    }

    function test_createRequest_RevertIf_FundingFails() public {
        RequestTypes.RequestParams memory p = RequestTypes.RequestParams({
            requester: abi.encodePacked(address(this)),
            answerType: RequestTypes.AnswerType.Bool,
            challengeWindow: 86400,
            rewardAmount: 100e6,
            question: "Is the sky blue?",
            context: "Weather report",
            truthMeaning: "True means sky is blue",
            originChainId: bytes(""),
            originAddress: bytes(""),
            isCrossChain: false
        });

        MockUSDC(usdc).setFailOnTransfer(true);

        vm.expectRevert("Funding failed");
        factory.createRequest(p);
    }

    function test_updateStatus_OnlyAuthorizedAllowed() public {
        address _request = __setUpDefaultRequest();

        vm.prank(address(0xDEAD));
        vm.expectRevert("Not authorized");
        IBaseRequestContract(_request).updateStatus(
            RequestTypes.RequestStatus.Resolved
        );
    }

    function test_updateStatus_SuccessfullyEmitsEvent() public {
        address _request = __setUpDefaultRequest();

        vm.expectEmit(true, true, false, false);
        emit IBaseRequestContract.RequestStatusUpdated(
            RequestTypes.RequestStatus.Resolved
        );

        vm.prank(address(oracleCoordinator));
        IBaseRequestContract(_request).updateStatus(
            RequestTypes.RequestStatus.Resolved
        );
    }

    function test_updateAnswer_OnlyAuthorizedAllowed() public {
        address _request = __setUpDefaultRequest();
        vm.prank(address(0xDEAD));
        vm.expectRevert("Not authorized");
        IBaseRequestContract(_request).updateAnswer("yada");
    }

    function test_updateAnswer_SuccessfullyEmitsEvent() public {
        address _request = __setUpDefaultRequest();

        vm.expectEmit(true, true, false, false);
        emit IBaseRequestContract.RequestAnswerUpdated("yada");

        vm.prank(address(oracleCoordinator));
        IBaseRequestContract(_request).updateAnswer("yada");
    }

    function test_updateAnswer_RevertIf_UpdateTwice() public {
        address _request = __setUpDefaultRequest();

        vm.prank(address(oracleCoordinator));
        IBaseRequestContract(_request).updateAnswer("yada");

        vm.expectRevert("Answer already set");
        vm.prank(address(oracleCoordinator));
        IBaseRequestContract(_request).updateAnswer("yada");
    }

    function test_updateAnswer_UpdateStatusToResolved() public {
        address _request = __setUpDefaultRequest();

        vm.expectEmit(true, true, false, false);
        emit IBaseRequestContract.RequestStatusUpdated(
            RequestTypes.RequestStatus.Resolved
        );

        vm.prank(address(oracleCoordinator));
        IBaseRequestContract(_request).updateAnswer("yada");

        assertTrue(
            IBaseRequestContract(_request).status() ==
                RequestTypes.RequestStatus.Resolved,
            "Status should be resolved"
        );
    }

    function test_getFullPrompt_BeforeAnswered() public {
        address _request = __setUpDefaultRequest();
        assertEq(
            IBaseRequestContract(_request).getFullPrompt(),
            string(
                abi.encodePacked(
                    IBaseRequestContract(_request).question(),
                    " | ",
                    IBaseRequestContract(_request).context(),
                    " | ",
                    IBaseRequestContract(_request).truthMeaning()
                )
            ),
            "data should match"
        );
    }

    function test_getFullPrompt_AfterAnswered() public {
        address _request = __setUpDefaultRequest();
        vm.prank(address(oracleCoordinator));
        IBaseRequestContract(_request).updateAnswer("yada");

        assertEq(
            IBaseRequestContract(_request).getFullPrompt(),
            string(
                abi.encodePacked(
                    IBaseRequestContract(_request).question(),
                    " | ",
                    IBaseRequestContract(_request).context(),
                    " | ",
                    IBaseRequestContract(_request).truthMeaning(),
                    " | ",
                    IBaseRequestContract(_request).answer()
                )
            ),
            "data should match"
        );
    }

    function __setUpDefaultRequest() internal returns (address _request) {
        RequestTypes.RequestParams memory p = RequestTypes.RequestParams({
            requester: abi.encodePacked(address(this)),
            answerType: RequestTypes.AnswerType.Bool,
            challengeWindow: 86400,
            rewardAmount: 100e6,
            question: "Is the sky blue?",
            context: "Weather report",
            truthMeaning: "True means sky is blue",
            originChainId: bytes(""),
            originAddress: bytes(""),
            isCrossChain: false
        });
        _request = factory.createRequest(p);
    }
}
