// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.24;

import "forge-std/Test.sol";
import {IAccessControl} from "@openzeppelin/contracts/access/IAccessControl.sol";
import {IOracleRelayer} from "../src/interfaces/IOracleRelayer.sol";
import {IOracleCoordinator} from "../src/interfaces/IOracleCoordinator.sol";
import {IBaseRequestContract} from "../src/interfaces/IBaseRequestContract.sol";

import {OracleCoordinator} from "../src/OracleCoordinator.sol";
import {RequestTypes} from "../src/types/RequestTypes.sol";

import {MockUSDC} from "../src/mocks/MockUSDC.sol";
import {MockOracleRelayer} from "../src/mocks/MockOracleRelayer.sol";
import {MockBaseRequestContract} from "../src/mocks/MockBaseRequestContract.sol";

contract OracleCoordinatorTest is Test {
    OracleCoordinator coordinator;
    MockUSDC usdc;

    address platform = address(0xABCD);
    address finalizer = address(0xBEEF);
    address factory = address(0xCAFE);
    address proposer = address(0x1001);
    address proposer2 = address(0x1002);

    address request;
    address requester = address(0x1234);
    MockBaseRequestContract requestContract;
    MockOracleRelayer oracleRelayer;

    function setUp() public {
        usdc = new MockUSDC();
        oracleRelayer = new MockOracleRelayer();
        coordinator = new OracleCoordinator(
            platform,
            address(oracleRelayer),
            address(usdc)
        );

        // GRANT ROLES
        vm.startPrank(platform);
        IAccessControl(address(coordinator)).grantRole(
            coordinator.FINALIZER_ROLE(),
            finalizer
        );
        IAccessControl(address(coordinator)).grantRole(
            coordinator.FACTORY_ROLE(),
            factory
        );
        vm.stopPrank();

        requestContract = new MockBaseRequestContract(
            abi.encode(requester),
            100e6,
            1 days,
            "What is the answer?",
            "Context",
            "True means Yes"
        );

        request = address(requestContract);

        deal(address(usdc), factory, 200e6);

        vm.prank(factory);
        usdc.approve(address(coordinator), type(uint256).max);

        // origin address mock for status changes
        vm.mockCall(
            request,
            abi.encodeWithSelector(IBaseRequestContract.originAddress.selector),
            abi.encode(abi.encode(address(0)))
        );

        // register upfront
        vm.prank(factory);
        coordinator.registerRequest(request);
    }

    function test_deployment_initializesRolesAndAddressesCorrectly()
        public
        view
    {
        assertEq(
            address(coordinator.usdc()),
            address(usdc),
            "Incorrect USDC address"
        );
        assertEq(
            coordinator.platform(),
            platform,
            "Incorrect platform address"
        );

        assertTrue(
            coordinator.hasRole(coordinator.DEFAULT_ADMIN_ROLE(), platform),
            "Admin role not set"
        );
        assertTrue(
            coordinator.hasRole(coordinator.FINALIZER_ROLE(), finalizer),
            "Finalizer role not set"
        );
        assertTrue(
            coordinator.hasRole(coordinator.FACTORY_ROLE(), factory),
            "Factory role not set"
        );
    }

    function test_registerRequest_allowsFactoryRoleAndEmitsOnSuccess() public {
        address simRequest = address(0x1212);
        address simRequester = address(0x2323);
        uint256 simRewardAmount = 100e6;

        vm.mockCall(
            simRequest,
            abi.encodeWithSelector(IBaseRequestContract.requester.selector),
            abi.encode(abi.encode(simRequester))
        );

        vm.mockCall(
            simRequest,
            abi.encodeWithSelector(IBaseRequestContract.rewardAmount.selector),
            abi.encode(simRewardAmount)
        );

        vm.mockCall(
            simRequest,
            abi.encodeWithSelector(IBaseRequestContract.originAddress.selector),
            abi.encode(abi.encode(address(0)))
        );

        deal(address(usdc), factory, 200e6);

        vm.prank(factory);
        usdc.approve(address(coordinator), type(uint256).max);

        vm.expectEmit(true, true, false, false);
        emit IOracleCoordinator.RequestRegistered(
            simRequest,
            abi.encode(simRequester) // bytes
        );

        vm.prank(factory);
        coordinator.registerRequest(simRequest);
    }

    function test_registerRequest_crossChain_Successful() public {
        address simRequest = address(0x1212);
        address simRequester = address(0x2323);
        uint256 simRewardAmount = 100e6;

        vm.mockCall(
            simRequest,
            abi.encodeWithSelector(IBaseRequestContract.requester.selector),
            abi.encode(abi.encode(simRequester))
        );

        vm.mockCall(
            simRequest,
            abi.encodeWithSelector(IBaseRequestContract.rewardAmount.selector),
            abi.encode(simRewardAmount)
        );

        vm.mockCall(
            simRequest,
            abi.encodeWithSelector(IBaseRequestContract.originAddress.selector),
            abi.encode(abi.encode(address(0xdead)))
        );

        vm.mockCall(
            simRequest,
            abi.encodeWithSelector(IBaseRequestContract.originChainId.selector),
            abi.encode(abi.encode(1337))
        );

        vm.mockCall(
            simRequest,
            abi.encodeWithSelector(
                IOracleRelayer.chainIdToChainSelector.selector
            ),
            abi.encode(1337)
        );

        deal(address(usdc), factory, 200e6);

        vm.prank(factory);
        usdc.approve(address(coordinator), type(uint256).max);

        vm.expectEmit(false, false, false, false);
        emit MockOracleRelayer.event_sendMessage();

        vm.expectEmit(true, true, false, false);
        emit IOracleCoordinator.RequestRegistered(
            simRequest,
            abi.encode(simRequester) // bytes
        );

        vm.prank(factory);
        coordinator.registerRequest(simRequest);
    }

    function test_registerRequest_RevertIf_FundingFailed() public {
        address simRequest = address(0x1212);
        address simRequester = address(0x2323);
        uint256 simRewardAmount = 100e6;

        vm.mockCall(
            simRequest,
            abi.encodeWithSelector(IBaseRequestContract.requester.selector),
            abi.encode(simRequester)
        );

        vm.mockCall(
            simRequest,
            abi.encodeWithSelector(IBaseRequestContract.rewardAmount.selector),
            abi.encode(simRewardAmount)
        );

        usdc.setFailOnTransfer(true);

        vm.prank(factory);
        vm.expectRevert("Funding failed");
        coordinator.registerRequest(simRequest);
    }

    function test_registerRequest_RevertIf_NonFactoryRole() public {
        address unauthorized = address(0xDEAD);
        vm.prank(unauthorized);
        vm.expectRevert();
        coordinator.registerRequest(address(0x1212));
    }

    function test_registerRequest_RevertIf_AlreadyRegistered() public {
        vm.prank(factory);
        vm.expectRevert("Request already exists");
        coordinator.registerRequest(request);
    }

    function test_registerRequest_RevertIf_RequestAddressIsZero() public {
        vm.prank(factory);
        vm.expectRevert("Invalid address");
        coordinator.registerRequest(address(0));
    }

    function test_proposeAnswer_succeedsWhenOpenAndBondPaid() public {
        bytes memory answer = bytes("42 is the answer");

        // allow USDC + fund proposer
        deal(address(usdc), proposer, 200e6);
        vm.prank(proposer);
        usdc.approve(address(coordinator), type(uint256).max);

        // expect event
        vm.expectEmit(true, true, false, false);
        emit IOracleCoordinator.AnswerProposed(request, proposer, answer);

        // call propose
        vm.prank(proposer);
        coordinator.proposeAnswer(request, answer);

        // optional assertion: proposal state set
        IOracleCoordinator.Proposal memory _proposal = coordinator.getProposal(
            request
        );
        assertEq(_proposal.proposer, proposer, "Proposal proposer mismatch");
    }

    function test_proposeAnswer_succeedsWithBoolAnswer() public {
        bytes memory answer = abi.encode(true);

        // allow USDC + fund proposer
        deal(address(usdc), proposer, 200e6);
        vm.prank(proposer);
        usdc.approve(address(coordinator), type(uint256).max);

        // call propose
        vm.prank(proposer);
        coordinator.proposeAnswer(request, answer);

        // optional assertion: proposal state set
        IOracleCoordinator.Proposal memory _proposal = coordinator.getProposal(
            request
        );

        assertEq(_proposal.proposer, proposer, "Proposal proposer mismatch");
        bool _answer = abi.decode(_proposal.answer, (bool));
        assertEq(_answer, true, "should habe true answer");
    }

    function test_proposeAnswer_RevertIf_AlreadyProposed() public {
        vm.mockCall(
            request,
            abi.encodeWithSelector(IBaseRequestContract.status.selector),
            abi.encode(RequestTypes.RequestStatus.Proposed)
        );

        vm.expectRevert("Already proposed");

        vm.prank(proposer);
        coordinator.proposeAnswer(request, "");
    }

    function test_proposeAnswer_RevertIf_BondTransferFailed() public {
        usdc.setFailOnTransfer(true);
        vm.expectRevert("Bond transfer failed");
        vm.prank(proposer);
        coordinator.proposeAnswer(request, bytes("original answer"));
    }

    function test_proposeAnswer_RevertIf_ProposerIsRequester() public {
        vm.expectRevert("Proposer not allowed");
        vm.prank(requester);
        coordinator.proposeAnswer(request, bytes("original answer"));
    }

    function test_challengeAnswer_succeedsWithValidInput() public {
        address challenger = address(0xDEAD);
        bytes memory answer = bytes("42 is wrong");
        bytes memory reason = bytes("Incorrect logic");

        deal(address(usdc), proposer, 200e6);
        vm.prank(proposer);
        usdc.approve(address(coordinator), type(uint256).max);
        vm.prank(proposer);
        coordinator.proposeAnswer(request, bytes("original answer"));

        deal(address(usdc), challenger, 200e6);
        vm.prank(challenger);
        usdc.approve(address(coordinator), type(uint256).max);

        assertFalse(
            coordinator.isChallenged(request),
            "Request should be not be challenged yet"
        );

        vm.expectEmit(true, true, false, false);
        emit IOracleCoordinator.ChallengeSubmitted(
            request,
            challenger,
            answer,
            reason
        );

        vm.prank(challenger);
        coordinator.challengeAnswer(request, false, answer, reason);

        // assert challenge stored
        IOracleCoordinator.Challenge memory _challenge = coordinator
            .getChallenge(request);
        assertEq(
            string(_challenge.answer),
            string(answer),
            "Challenge answer mismatch"
        );

        assertTrue(
            coordinator.isChallenged(request),
            "Request should be challenged"
        );
    }

    function test_challengeAnswer_RevertIf_ChallengeBondFailed() public {
        address challenger = address(0xDEAD);
        bytes memory answer = bytes("42 is wrong");
        bytes memory reason = bytes("Incorrect logic");

        deal(address(usdc), proposer, 200e6);
        vm.prank(proposer);
        usdc.approve(address(coordinator), type(uint256).max);
        vm.prank(proposer);
        coordinator.proposeAnswer(request, bytes("original answer"));

        deal(address(usdc), challenger, 200e6);
        vm.prank(challenger);
        usdc.approve(address(coordinator), type(uint256).max);

        usdc.setFailOnTransfer(true);

        vm.expectRevert("Challenge bond failed");

        vm.prank(challenger);
        coordinator.challengeAnswer(request, false, answer, reason);
    }

    function test_challengeAnswer_RevertIf_CallerIsRequester() public {
        bytes memory answer = bytes("disagree");
        bytes memory reason = bytes("conflict of interest");

        deal(address(usdc), proposer, 200e6);
        vm.startPrank(proposer);
        usdc.approve(address(coordinator), type(uint256).max);
        coordinator.proposeAnswer(request, bytes("initial"));

        // requester (who is globally set) tries to challenge their own request
        deal(address(usdc), requester, 200e6);
        vm.startPrank(requester);
        usdc.approve(address(coordinator), type(uint256).max);

        vm.expectRevert("Challenger not allowed");
        coordinator.challengeAnswer(request, false, answer, reason);
    }

    function test_challengeAnswer_RevertIf_StatusNotProposed() public {
        address challenger1 = address(0x1111);
        address challenger2 = address(0x2222);
        bytes memory answer1 = bytes("first challenge");
        bytes memory answer2 = bytes("second challenge");
        bytes memory reason = bytes("some reason");

        // proposer submits
        deal(address(usdc), proposer, 200e6);
        vm.startPrank(proposer);
        usdc.approve(address(coordinator), type(uint256).max);
        coordinator.proposeAnswer(request, bytes("the original"));

        // challenger1 submits first valid challenge
        deal(address(usdc), challenger1, 200e6);
        vm.startPrank(challenger1);
        usdc.approve(address(coordinator), type(uint256).max);
        coordinator.challengeAnswer(request, false, answer1, reason);

        // challenger2 tries second challenge
        deal(address(usdc), challenger2, 200e6);
        vm.startPrank(challenger2);
        usdc.approve(address(coordinator), type(uint256).max);

        vm.expectRevert("Not proposed");
        coordinator.challengeAnswer(request, false, answer2, reason);
    }

    function test_submitReview_succeedsWithValidInput() public {
        address reviewer = address(0xBADA);
        address challenger = address(0xDEAD);
        bytes memory challengeAnswer = bytes("42 is wrong");
        bytes memory challengeReason = bytes("logic flawed");
        bytes memory reviewReason = bytes("agree with challenge");

        // 1. Propose
        deal(address(usdc), proposer, 200e6);
        vm.startPrank(proposer);
        usdc.approve(address(coordinator), type(uint256).max);
        coordinator.proposeAnswer(request, bytes("original"));

        // 2. Challenge
        deal(address(usdc), challenger, 200e6);
        vm.startPrank(challenger);
        usdc.approve(address(coordinator), type(uint256).max);
        coordinator.challengeAnswer(
            request,
            false,
            challengeAnswer,
            challengeReason
        );

        // 3. Submit review
        deal(address(usdc), reviewer, 200e6);
        vm.startPrank(reviewer);
        usdc.approve(address(coordinator), type(uint256).max);

        vm.expectEmit(true, true, false, false);
        emit IOracleCoordinator.ReviewSubmitted(
            request,
            reviewer,
            reviewReason,
            true
        );

        coordinator.submitReview(request, reviewReason, true);

        // Optional assertion: check vote recorded
        IOracleCoordinator.Challenge memory _challenge = coordinator
            .getChallenge(request);
        assertEq(_challenge.reviews.length, 1, "Expected one review recorded");
        assertEq(_challenge.reviews[0].reviewer, reviewer, "Reviewer mismatch");
    }

    function test_submitReview_RevertIf_AlreadyReviewed() public {
        address reviewer = address(0xBADA);
        address challenger = address(0xDEAD);
        bytes memory challengeAnswer = bytes("wrong");
        bytes memory challengeReason = bytes("explanation");
        bytes memory reviewReason1 = bytes("1st reason");
        bytes memory reviewReason2 = bytes("2nd reason");

        // 1. Propose
        deal(address(usdc), proposer, 200e6);
        vm.startPrank(proposer);
        usdc.approve(address(coordinator), type(uint256).max);
        coordinator.proposeAnswer(request, bytes("original"));

        // 2. Challenge
        deal(address(usdc), challenger, 200e6);
        vm.startPrank(challenger);
        usdc.approve(address(coordinator), type(uint256).max);
        coordinator.challengeAnswer(
            request,
            false,
            challengeAnswer,
            challengeReason
        );

        // 3. First review
        deal(address(usdc), reviewer, 200e6);
        vm.startPrank(reviewer);
        usdc.approve(address(coordinator), type(uint256).max);
        coordinator.submitReview(request, reviewReason1, true);

        // 4. Second review – should revert
        vm.expectRevert("Already reviewed");
        coordinator.submitReview(request, reviewReason2, false);
    }

    function test_submitReview_RevertIf_ReviewBondFailed() public {
        address reviewer = address(0xBADA);
        address challenger = address(0xDEAD);
        bytes memory challengeAnswer = bytes("42 is wrong");
        bytes memory challengeReason = bytes("logic flawed");
        bytes memory reviewReason = bytes("agree with challenge");

        deal(address(usdc), proposer, 200e6);
        vm.startPrank(proposer);
        usdc.approve(address(coordinator), type(uint256).max);
        coordinator.proposeAnswer(request, bytes("original"));

        deal(address(usdc), challenger, 200e6);
        vm.startPrank(challenger);
        usdc.approve(address(coordinator), type(uint256).max);
        coordinator.challengeAnswer(
            request,
            false,
            challengeAnswer,
            challengeReason
        );

        deal(address(usdc), reviewer, 200e6);
        vm.startPrank(reviewer);
        usdc.approve(address(coordinator), type(uint256).max);

        usdc.setFailOnTransfer(true);
        vm.expectRevert("Review bond failed");

        coordinator.submitReview(request, reviewReason, true);
    }

    function test_submitReview_RevertIf_StatusNotChallenged() public {
        address reviewer = address(0xBADA);
        bytes memory reviewReason = bytes("status invalid");

        // Prepare reviewer
        deal(address(usdc), reviewer, 200e6);
        vm.startPrank(reviewer);
        usdc.approve(address(coordinator), type(uint256).max);

        vm.expectRevert("Not challenged");
        coordinator.submitReview(request, reviewReason, true);
        vm.stopPrank();
    }

    function test_submitReview_RevertIf_ReviewerIsProposer() public {
        bytes memory reviewReason = bytes("biased");

        // Propose
        deal(address(usdc), proposer, 200e6);
        vm.startPrank(proposer);
        usdc.approve(address(coordinator), type(uint256).max);
        coordinator.proposeAnswer(request, bytes("original"));

        // Challenge by someone else
        address challenger = address(0xDAD1);
        deal(address(usdc), challenger, 200e6);
        vm.startPrank(challenger);
        usdc.approve(address(coordinator), type(uint256).max);
        coordinator.challengeAnswer(
            request,
            false,
            bytes("challenge"),
            bytes("why")
        );

        vm.startPrank(proposer);
        vm.expectRevert("Reviewer is proposer");
        coordinator.submitReview(request, reviewReason, true);
    }

    function test_submitReview_RevertIf_ReviewerIsRequester() public {
        bytes memory reviewReason = bytes("biased");

        // Propose
        deal(address(usdc), proposer, 200e6);
        vm.startPrank(proposer);
        usdc.approve(address(coordinator), type(uint256).max);
        coordinator.proposeAnswer(request, bytes("original"));

        // Challenge by someone else
        address challenger = address(0xDAD1);
        deal(address(usdc), challenger, 200e6);
        vm.startPrank(challenger);
        usdc.approve(address(coordinator), type(uint256).max);
        coordinator.challengeAnswer(
            request,
            false,
            bytes("challenge"),
            bytes("why")
        );

        vm.startPrank(requester);
        vm.expectRevert("Reviewer is requester");
        coordinator.submitReview(request, reviewReason, true);
    }

    function test_submitReview_RevertIf_ReviewerIsChallenger() public {
        address challenger = address(0xDAD1);
        bytes memory reviewReason = bytes("biased again");

        // Propose
        deal(address(usdc), proposer, 200e6);
        vm.startPrank(proposer);
        usdc.approve(address(coordinator), type(uint256).max);
        coordinator.proposeAnswer(request, bytes("original"));

        // Challenge
        deal(address(usdc), challenger, 200e6);
        vm.startPrank(challenger);
        usdc.approve(address(coordinator), type(uint256).max);
        coordinator.challengeAnswer(
            request,
            false,
            bytes("challenge"),
            bytes("why")
        );

        vm.expectRevert("Reviewer is challenger");
        coordinator.submitReview(request, reviewReason, false);
    }

    function test_finalizeRequest_proposerWinsIfUnchallenged() public {
        uint96 reward = 100e6;

        vm.mockCall(
            request,
            abi.encodeWithSelector(IBaseRequestContract.rewardAmount.selector),
            abi.encode(reward)
        );

        // Prepare balances
        deal(address(usdc), address(coordinator), reward); // reward already in coordinator
        deal(address(usdc), proposer, 200e6); // enough for bond

        vm.startPrank(proposer);
        usdc.approve(address(coordinator), type(uint256).max);
        coordinator.proposeAnswer(request, bytes("final answer"));
        vm.stopPrank();

        // back to the future
        vm.warp(block.timestamp + 2 days); // REVIEW_WINDOW = 1 day, assume enough

        // Expect emits
        vm.expectEmit(true, true, false, false);
        emit IOracleCoordinator.BondRefunded(request, proposer, 100e6);

        vm.expectEmit(true, true, false, false);
        emit IOracleCoordinator.RewardDistributed(
            request,
            proposer,
            90e6,
            IOracleCoordinator.RewardType.Proposer
        );

        vm.expectEmit(true, true, false, false);
        emit IOracleCoordinator.RewardDistributed(
            request,
            platform,
            10e6,
            IOracleCoordinator.RewardType.Platform
        );

        vm.expectEmit(true, true, false, false);
        emit IOracleCoordinator.RequestResolved(
            request,
            RequestTypes.RequestStatus.Resolved
        );

        // Finalize
        vm.prank(finalizer);
        coordinator.finalizeRequest(request);

        // Check balances
        assertEq(
            usdc.balanceOf(proposer),
            290e6,
            "Proposer should get bond + 90% of reward"
        );
        assertEq(
            usdc.balanceOf(platform),
            10e6,
            "Platform should get 10% of reward"
        );

        IOracleCoordinator.UserStats memory _stats = coordinator.getUserStats(
            proposer
        );
        assertEq(_stats.proposed, uint256(1));
        assertEq(_stats.proposedSuccess, uint256(1));
    }

    function test_finalizeRequest_challengerWinsOnSuccessfulChallenge() public {
        address challenger = address(0xC1);
        address reviewer = address(0xC2);
        uint96 reward = 100e6;
        bytes memory challengeAnswer = bytes("correct");
        bytes memory challengeReason = bytes("fixing it");
        bytes memory reviewReason = bytes("supporting challenger");

        vm.mockCall(
            request,
            abi.encodeWithSelector(IBaseRequestContract.rewardAmount.selector),
            abi.encode(reward)
        );

        // fund reward
        deal(address(usdc), address(coordinator), reward);

        // Setup: proposer submits
        deal(address(usdc), proposer, 200e6);
        vm.startPrank(proposer);
        usdc.approve(address(coordinator), type(uint256).max);
        coordinator.proposeAnswer(request, bytes("wrong"));

        // Challenge
        deal(address(usdc), challenger, 200e6);
        vm.startPrank(challenger);
        usdc.approve(address(coordinator), type(uint256).max);
        coordinator.challengeAnswer(
            request,
            false,
            challengeAnswer,
            challengeReason
        );

        // Review in support of challenge
        deal(address(usdc), reviewer, 200e6);
        vm.startPrank(reviewer);
        usdc.approve(address(coordinator), type(uint256).max);
        coordinator.submitReview(request, reviewReason, true); // votesFor = 1
        vm.stopPrank();
        // No opposing votes → votesFor > votesAgainst

        // Warp beyond review window
        vm.warp(block.timestamp + 2 days);

        // Expect emissions
        vm.expectEmit(true, true, false, false);
        emit IOracleCoordinator.RewardDistributed(
            request,
            challenger,
            160e6,
            IOracleCoordinator.RewardType.Challenger
        ); // 80% of 200e6

        vm.expectEmit(true, true, false, false);
        emit IOracleCoordinator.RewardDistributed(
            request,
            platform,
            20e6,
            IOracleCoordinator.RewardType.Platform
        ); // ~10%

        vm.expectEmit(true, true, false, false);
        emit IOracleCoordinator.RequestResolved(
            request,
            RequestTypes.RequestStatus.Resolved
        );

        vm.mockCall(
            request,
            abi.encodeWithSelector(IBaseRequestContract.rewardAmount.selector),
            abi.encode(reward)
        );

        // Finalize
        vm.prank(finalizer);
        coordinator.finalizeRequest(request);

        // Validate balances
        assertEq(
            usdc.balanceOf(challenger),
            // personal bond  + share of proposer bond + share of reward + balance after challenging
            100e6 + 80e6 + 80e6 + 100e6,
            "Challenger payout"
        );
        assertEq(usdc.balanceOf(platform), 20e6, "Platform fee");

        // Reviewer claim is stored, not transferred yet
        uint256 claimable = coordinator.reviewerClaimAmount(request);
        assertGt(claimable, 0, "Reviewer should have claimable amount");
    }

    function test_finalizeRequest_proposerWinsOnUnsuccessfulChallenge() public {
        address challenger = address(0xC1);
        address reviewer = address(0xC2);
        uint96 reward = 100e6;
        bytes memory challengeAnswer = bytes("wrong");
        bytes memory challengeReason = bytes("not valid");
        bytes memory reviewReason = bytes("disagree with challenge");

        // fund reward
        deal(address(usdc), address(coordinator), reward);

        // Step 1: proposer submits
        deal(address(usdc), proposer, 200e6);
        vm.startPrank(proposer);
        usdc.approve(address(coordinator), type(uint256).max);
        coordinator.proposeAnswer(request, bytes("true"));

        // Step 2: challenger challenges
        deal(address(usdc), challenger, 200e6);
        vm.startPrank(challenger);
        usdc.approve(address(coordinator), type(uint256).max);
        coordinator.challengeAnswer(
            request,
            false,
            challengeAnswer,
            challengeReason
        );

        // Step 3: reviewer disagrees with challenge
        deal(address(usdc), reviewer, 200e6);
        vm.startPrank(reviewer);
        usdc.approve(address(coordinator), type(uint256).max);
        coordinator.submitReview(request, reviewReason, false); // votesAgainst = 1
        vm.stopPrank();

        // Step 4: simulate review window expired
        vm.warp(block.timestamp + 2 days);

        vm.mockCall(
            request,
            abi.encodeWithSelector(IBaseRequestContract.rewardAmount.selector),
            abi.encode(reward)
        );

        // Expect emits
        vm.expectEmit(true, true, false, false);
        emit IOracleCoordinator.BondRefunded(request, proposer, 100e6);

        vm.expectEmit(true, true, false, false);
        emit IOracleCoordinator.RewardDistributed(
            request,
            proposer,
            90e6,
            IOracleCoordinator.RewardType.Proposer
        );

        vm.expectEmit(true, true, false, false);
        emit IOracleCoordinator.RewardDistributed(
            request,
            platform,
            10e6,
            IOracleCoordinator.RewardType.Platform
        );

        vm.expectEmit(true, true, false, false);
        emit IOracleCoordinator.RequestResolved(
            request,
            RequestTypes.RequestStatus.Resolved
        );

        // Finalize
        vm.prank(finalizer);
        coordinator.finalizeRequest(request);

        // Assertions
        assertEq(
            usdc.balanceOf(proposer),
            // proposer payout + balancer after propose
            190e6 + 100e6,
            "Proposer payout"
        );
        assertEq(usdc.balanceOf(platform), 20e6, "Platform fee");

        uint256 claimable = coordinator.reviewerClaimAmount(request);
        assertGt(claimable, 0, "Reviewer should have claimable amount");
    }

    function test_finalizeRequest_RevertIf_NotFinalizable() public {
        uint96 reward = 100e6;

        vm.mockCall(
            request,
            abi.encodeWithSelector(IBaseRequestContract.rewardAmount.selector),
            abi.encode(reward)
        );

        // Prepare balances
        deal(address(usdc), address(coordinator), reward); // reward already in coordinator
        deal(address(usdc), proposer, 200e6); // enough for bond

        vm.prank(proposer);
        usdc.approve(address(coordinator), type(uint256).max);
        vm.prank(proposer);
        coordinator.proposeAnswer(request, bytes("final answer"));

        vm.expectRevert("Not finalizable");

        vm.prank(finalizer);
        coordinator.finalizeRequest(request);
    }

    function test_finalizeRequest_RevertIf_FailProposerTransfer() public {
        uint96 reward = 100e6;

        vm.mockCall(
            request,
            abi.encodeWithSelector(IBaseRequestContract.rewardAmount.selector),
            abi.encode(reward)
        );

        // Prepare balances
        deal(address(usdc), address(coordinator), reward); // reward already in coordinator
        deal(address(usdc), proposer, 200e6); // enough for bond

        vm.startPrank(proposer);
        usdc.approve(address(coordinator), type(uint256).max);
        coordinator.proposeAnswer(request, bytes("final answer"));
        vm.stopPrank();

        // back to the future
        vm.warp(block.timestamp + 2 days); // REVIEW_WINDOW = 1 day, assume enough

        usdc.setFailOnTransfer(true);
        vm.expectRevert("Fail proposer transfer");

        // Finalize
        vm.prank(finalizer);
        coordinator.finalizeRequest(request);
    }

    function test_finalizeRequest_RevertIf_FailChallengerTransfer() public {
        address challenger = address(0xC1);
        address reviewer = address(0xC2);
        uint96 reward = 100e6;
        bytes memory challengeAnswer = bytes("correct");
        bytes memory challengeReason = bytes("fixing it");
        bytes memory reviewReason = bytes("supporting challenger");

        vm.mockCall(
            request,
            abi.encodeWithSelector(IBaseRequestContract.rewardAmount.selector),
            abi.encode(reward)
        );

        // fund reward
        deal(address(usdc), address(coordinator), reward);

        // Setup: proposer submits
        deal(address(usdc), proposer, 200e6);
        vm.startPrank(proposer);
        usdc.approve(address(coordinator), type(uint256).max);
        coordinator.proposeAnswer(request, bytes("wrong"));

        // Challenge
        deal(address(usdc), challenger, 200e6);
        vm.startPrank(challenger);
        usdc.approve(address(coordinator), type(uint256).max);
        coordinator.challengeAnswer(
            request,
            false,
            challengeAnswer,
            challengeReason
        );

        // Review in support of challenge
        deal(address(usdc), reviewer, 200e6);
        vm.startPrank(reviewer);
        usdc.approve(address(coordinator), type(uint256).max);
        coordinator.submitReview(request, reviewReason, true); // votesFor = 1
        vm.stopPrank();
        // No opposing votes → votesFor > votesAgainst

        // Warp beyond review window
        vm.warp(block.timestamp + 2 days);

        vm.mockCall(
            request,
            abi.encodeWithSelector(IBaseRequestContract.rewardAmount.selector),
            abi.encode(reward)
        );

        usdc.setFailOnTransfer(true);
        vm.expectRevert("Fail challenger transfer");
        vm.prank(finalizer);
        coordinator.finalizeRequest(request);
    }

    function test_finalizeRequest_RevertIf_FailProposerTransferOnChallengedWin()
        public
    {
        address challenger = address(0xC1);
        address reviewer = address(0xC2);
        uint96 reward = 100e6;
        bytes memory challengeAnswer = bytes("wrong");
        bytes memory challengeReason = bytes("not valid");
        bytes memory reviewReason = bytes("disagree with challenge");

        // fund reward
        deal(address(usdc), address(coordinator), reward);

        // Step 1: proposer submits
        deal(address(usdc), proposer, 200e6);
        vm.startPrank(proposer);
        usdc.approve(address(coordinator), type(uint256).max);
        coordinator.proposeAnswer(request, bytes("true"));

        // Step 2: challenger challenges
        deal(address(usdc), challenger, 200e6);
        vm.startPrank(challenger);
        usdc.approve(address(coordinator), type(uint256).max);
        coordinator.challengeAnswer(
            request,
            false,
            challengeAnswer,
            challengeReason
        );

        // Step 3: reviewer disagrees with challenge
        deal(address(usdc), reviewer, 200e6);
        vm.startPrank(reviewer);
        usdc.approve(address(coordinator), type(uint256).max);
        coordinator.submitReview(request, reviewReason, false); // votesAgainst = 1
        vm.stopPrank();

        // Step 4: simulate review window expired
        vm.warp(block.timestamp + 2 days);

        vm.mockCall(
            request,
            abi.encodeWithSelector(IBaseRequestContract.rewardAmount.selector),
            abi.encode(reward)
        );

        usdc.setFailOnTransfer(true);
        vm.expectRevert("Fail proposer transfer");
        vm.prank(finalizer);
        coordinator.finalizeRequest(request);
    }

    function test_finalizeRequest_RevertIf_NotFinalizer() public {
        address unauthorized = address(0xb0bb1);
        vm.expectRevert();
        vm.prank(unauthorized);
        coordinator.claimReward(request);
    }

    function test_claimReward_succeedsForWinningReviewer() public {
        address challenger = address(0xC1);
        address reviewer = address(0xC2);
        bytes memory challengeAnswer = bytes("fixed");
        bytes memory challengeReason = bytes("correct");
        bytes memory reviewReason = bytes("agree");

        deal(address(usdc), address(coordinator), 100e6); // reward

        // 1. Propose
        deal(address(usdc), proposer, 200e6);
        vm.prank(proposer);
        usdc.approve(address(coordinator), type(uint256).max);
        vm.prank(proposer);
        coordinator.proposeAnswer(request, bytes("wrong"));

        // 2. Challenge
        deal(address(usdc), challenger, 200e6);
        vm.prank(challenger);
        usdc.approve(address(coordinator), type(uint256).max);
        vm.prank(challenger);
        coordinator.challengeAnswer(
            request,
            false,
            challengeAnswer,
            challengeReason
        );

        // 3. Review (supports challenge)
        deal(address(usdc), reviewer, 200e6);
        vm.prank(reviewer);
        usdc.approve(address(coordinator), type(uint256).max);
        vm.prank(reviewer);
        coordinator.submitReview(request, reviewReason, true); // votesFor = 1

        // chlaimable check
        assertFalse(
            coordinator.isClaimable(request, reviewer),
            "should not be claimable"
        );

        // try to claim before finalization
        vm.expectRevert("Not allowed to claim");
        vm.prank(reviewer);
        coordinator.claimReward(request);

        // 4. Finalize (Challenge wins)
        vm.warp(block.timestamp + 2 days);
        vm.prank(finalizer);
        coordinator.finalizeRequest(request);

        // chlaimable check
        assertTrue(
            coordinator.isClaimable(request, reviewer),
            "should be claimable now"
        );

        // 5. Reviewer claims reward
        uint256 previousClaimerBalance = usdc.balanceOf(reviewer);
        uint256 expected = coordinator.reviewerClaimAmount(request);

        vm.expectEmit(true, true, false, false);
        emit IOracleCoordinator.RewardDistributed(
            request,
            reviewer,
            expected,
            IOracleCoordinator.RewardType.Reviewer
        );

        vm.prank(reviewer);
        coordinator.claimReward(request);

        assertEq(
            usdc.balanceOf(reviewer),
            expected + previousClaimerBalance,
            "Reviewer should get reward"
        );

        // Reclaim attempt → revert
        vm.expectRevert("Not allowed to claim");
        vm.prank(reviewer);
        coordinator.claimReward(request);

        // check reviwers
        IOracleCoordinator.Review[] memory _reviews = coordinator.getReviews(
            request
        );
        assertEq(_reviews[0].reviewer, reviewer);

        // check tally
        (uint256 forVotes, uint256 againstVotes) = coordinator.getReviewTally(
            request
        );
        assertEq(forVotes, 1);
        assertEq(againstVotes, 0);

        // check user stats
        IOracleCoordinator.UserStats memory _stats;

        _stats = coordinator.getUserStats(proposer);
        assertEq(_stats.proposed, uint256(1));
        assertEq(_stats.proposedSuccess, uint256(0));
        assertEq(_stats.challenged, uint256(0));
        assertEq(_stats.challengedSuccess, uint256(0));
        assertEq(_stats.reviewed, uint256(0));
        assertEq(_stats.reviewedSuccess, uint256(0));

        _stats = coordinator.getUserStats(challenger);
        assertEq(_stats.proposed, uint256(0));
        assertEq(_stats.proposedSuccess, uint256(0));
        assertEq(_stats.challenged, uint256(1));
        assertEq(_stats.challengedSuccess, uint256(1));
        assertEq(_stats.reviewed, uint256(0));
        assertEq(_stats.reviewedSuccess, uint256(0));

        _stats = coordinator.getUserStats(reviewer);
        assertEq(_stats.proposed, uint256(0));
        assertEq(_stats.proposedSuccess, uint256(0));
        assertEq(_stats.challenged, uint256(0));
        assertEq(_stats.challengedSuccess, uint256(0));
        assertEq(_stats.reviewed, uint256(1));
        assertEq(_stats.reviewedSuccess, uint256(1));
    }

    function test_claimReward_RevertIf_FailReviewerTransfer() public {
        address challenger = address(0xC1);
        address reviewer = address(0xC2);
        bytes memory challengeAnswer = bytes("fixed");
        bytes memory challengeReason = bytes("correct");
        bytes memory reviewReason = bytes("agree");

        deal(address(usdc), address(coordinator), 100e6); // reward

        // 1. Propose
        deal(address(usdc), proposer, 200e6);
        vm.prank(proposer);
        usdc.approve(address(coordinator), type(uint256).max);
        vm.prank(proposer);
        coordinator.proposeAnswer(request, bytes("wrong"));

        // 2. Challenge
        deal(address(usdc), challenger, 200e6);
        vm.prank(challenger);
        usdc.approve(address(coordinator), type(uint256).max);
        vm.prank(challenger);
        coordinator.challengeAnswer(
            request,
            false,
            challengeAnswer,
            challengeReason
        );

        // 3. Review (supports challenge)
        deal(address(usdc), reviewer, 200e6);
        vm.prank(reviewer);
        usdc.approve(address(coordinator), type(uint256).max);
        vm.prank(reviewer);
        coordinator.submitReview(request, reviewReason, true); // votesFor = 1

        // 4. Finalize (Challenge wins)
        vm.warp(block.timestamp + 2 days);
        vm.prank(finalizer);
        coordinator.finalizeRequest(request);

        usdc.setFailOnTransfer(true);
        vm.expectRevert("Fail reviewer transfer");

        vm.prank(reviewer);
        coordinator.claimReward(request);
    }

    function test_claimReward_RevertIf_ReviewerWasOnLosingSide() public {
        address challenger = address(0xC1);
        address reviewer = address(0xC2);
        bytes memory challengeAnswer = bytes("corrected");
        bytes memory challengeReason = bytes("logic fix");
        bytes memory reviewReason = bytes("I disagree");

        deal(address(usdc), address(coordinator), 100e6);

        // 1. Propose
        deal(address(usdc), proposer, 200e6);
        vm.prank(proposer);
        usdc.approve(address(coordinator), type(uint256).max);
        vm.prank(proposer);
        coordinator.proposeAnswer(request, bytes("original"));

        // 2. Challenge
        deal(address(usdc), challenger, 200e6);
        vm.prank(challenger);
        usdc.approve(address(coordinator), type(uint256).max);
        vm.prank(challenger);
        coordinator.challengeAnswer(
            request,
            false,
            challengeAnswer,
            challengeReason
        );

        // 3. Review (opposes challenge)
        deal(address(usdc), reviewer, 200e6);
        vm.prank(reviewer);
        usdc.approve(address(coordinator), type(uint256).max);
        vm.prank(reviewer);
        coordinator.submitReview(request, reviewReason, false); // votesAgainst = 1

        // 4. Finalize (Challenge wins: no opposing votes)
        vm.warp(block.timestamp + 2 days);

        vm.prank(finalizer);
        coordinator.finalizeRequest(request);

        // 5. Claim → should fail
        vm.expectRevert("Not allowed to claim");
        vm.prank(reviewer);
        coordinator.claimReward(request);
    }

    function test_checkUpkeep_returnsTrueWhenFinalizableExists() public {
        deal(address(usdc), proposer, 200e6);
        vm.prank(proposer);
        usdc.approve(address(coordinator), type(uint256).max);
        vm.prank(proposer);
        coordinator.proposeAnswer(request, bytes("some answer"));

        {
            // Check Upkeep
            (bool upkeepNeeded, bytes memory performData) = coordinator
                .checkUpkeep("");

            assertFalse(upkeepNeeded, "Expected upkeepNeeded to be false");
            assertEq(
                performData,
                bytes(""),
                "Unexpected request in performData"
            );
        }

        // Zeit simulieren – Challenge Window abgelaufen
        vm.warp(block.timestamp + 2 days); // > challengeWindow()

        {
            // Check Upkeep
            (bool upkeepNeeded, bytes memory performData) = coordinator
                .checkUpkeep("");

            assertTrue(upkeepNeeded, "Expected upkeepNeeded to be true");
            assertEq(
                abi.decode(performData, (address)),
                request,
                "Unexpected request in performData"
            );
        }
    }

    function test_performUpkeep_finalizesRequestCorrectly() public {
        // Step 1: propose
        deal(address(usdc), proposer, 200e6);
        vm.prank(proposer);
        usdc.approve(address(coordinator), type(uint256).max);
        vm.prank(proposer);
        coordinator.proposeAnswer(request, bytes("pending"));

        // Step 2: warp beyond challenge window
        vm.warp(block.timestamp + 2 days);

        // Step 3: Expect emits
        vm.expectEmit(true, true, false, false);
        emit IOracleCoordinator.RequestResolved(
            request,
            RequestTypes.RequestStatus.Resolved
        );

        // Step 4: perform upkeep
        bytes memory performData = abi.encode(request);
        vm.prank(finalizer);
        coordinator.performUpkeep(performData);

        // Step 5: Ensure status updated via mock
        RequestTypes.RequestStatus status = requestContract.status();
        assertEq(
            uint8(status),
            uint8(RequestTypes.RequestStatus.Resolved),
            "Status should be Resolved"
        );
    }

    function test_performUpkeep_RevertIf_Invalid() public {
        vm.expectRevert();
        vm.prank(finalizer);
        coordinator.performUpkeep(abi.encode(address(0x1234)));
    }

    function test_getMostRecentPendingFinalization_NoValidAddress()
        public
        view
    {
        assertEq(
            coordinator.getMostRecentPendingFinalization(),
            address(0),
            "should not have a valid address"
        );
    }

    function test_getMostRecentPendingFinalization_ValidAddress() public {
        // Step 1: propose
        deal(address(usdc), proposer, 200e6);
        vm.prank(proposer);
        usdc.approve(address(coordinator), type(uint256).max);
        vm.prank(proposer);
        coordinator.proposeAnswer(request, bytes("pending"));

        // Step 2: warp beyond challenge window
        vm.warp(block.timestamp + 2 days);

        assertEq(
            coordinator.getMostRecentPendingFinalization(),
            request,
            "Expected valid address"
        );
    }
}
