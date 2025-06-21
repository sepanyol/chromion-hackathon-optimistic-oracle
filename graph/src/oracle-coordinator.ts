import {
  Address,
  BigDecimal,
  BigInt,
  Bytes,
  crypto,
  ethereum,
  log,
} from "@graphprotocol/graph-ts";

import {
  AnswerProposed,
  BondRefunded,
  ChallengeSubmitted,
  OracleCoordinator,
  RequestRegistered,
  RequestResolved,
  ReviewSubmitted,
  RewardDistributed,
} from "../generated/OracleCoordinator/OracleCoordinator";
import { RequestContract } from "../generated/templates/RequestContract/RequestContract";
import {
  getChallengeReview,
  getDashboard,
  getProposalChallenge,
  getRequest,
  getRequestProposal,
  getUser,
  getUserChallenger,
  getUserChallengerStats,
  getUserProposer,
  getUserProposerStats,
  getUserRequester,
  getUserRequesterStats,
  getUserReviewer,
  getUserReviewerStats,
  INT32_ONE,
} from "./helpers";
import { createMockedFunction } from "matchstick-as";
import { User } from "../generated/schema";

export function handleRequestRegistered(event: RequestRegistered): void {
  const _request = getRequest(event.params.request);

  if (event.params.requester.length < 32) {
    log.warning("Invalid requester bytes length: {}", [
      event.params.requester.toHex(),
    ]);
    return;
  }
  const _user = getUser(
    Address.fromBytes(
      Bytes.fromUint8Array(event.params.requester.subarray(12, 32))
    )
  );

  const _requester = getUserRequester(_user.id);
  const _requesterStats = getUserRequesterStats(_requester.stats);
  const _dashboard = getDashboard();

  const requestContract = RequestContract.bind(Address.fromBytes(_request.id));

  _request.originAddress = requestContract.originAddress();
  _request.originChainId = requestContract.originChainId();
  _request.answerType = requestContract.answerType();
  _request.challengeWindow = requestContract.challengeWindow();
  _request.rewardAmount = requestContract.rewardAmount();
  _request.question = requestContract.question();
  _request.context = requestContract.context();
  _request.truthMeaning = requestContract.truthMeaning();
  _request.isCrossChain = !requestContract.isOracleChain();
  _request.createdAt = event.block.timestamp;
  _request.status = requestContract.status();

  // connect user with requester
  _user.requester = _requester.id;

  // connect request with requester
  _request.requester = _requester.id;

  // count stats
  _requesterStats.requests = _requesterStats.requests.plus(INT32_ONE);
  _requesterStats.requestsActive =
    _requesterStats.requestsActive.plus(INT32_ONE);

  // update dashboard
  _dashboard.totalRequests = _dashboard.totalRequests.plus(INT32_ONE);

  _dashboard.save();
  _request.save();
  _user.save();
  _requester.save();
  _requesterStats.save();
}

export function handleAnswerProposed(event: AnswerProposed): void {
  const _request = getRequest(event.params.request);
  const _proposal = getRequestProposal(_request.id);
  const _user = getUser(event.params.proposer);
  const _proposer = getUserProposer(_user.id);
  const _proposerStats = getUserProposerStats(_proposer.stats);
  const _dashboard = getDashboard();

  const requestContract = RequestContract.bind(Address.fromBytes(_request.id));
  _request.status = requestContract.status();

  // enrich proposal
  _proposal.request = _request.id;
  _proposal.proposer = _proposer.id;
  _proposal.answer = event.params.answer;
  _proposal.createdAt = event.block.timestamp;

  // enrich proposer
  _proposer.stats = _proposerStats.id;

  // enrich user
  _user.proposer = _proposer.id;

  // update proposer stats
  _proposerStats.proposals = _proposerStats.proposals.plus(INT32_ONE);
  _proposerStats.proposalsActive = _proposerStats.proposals.plus(INT32_ONE);

  // update dashboard
  _dashboard.proposals = _dashboard.proposals.plus(INT32_ONE);

  _dashboard.save();
  _request.save();
  _proposal.save();
  _user.save();
  _proposer.save();
  _proposerStats.save();
}

export function handleChallengeSubmitted(event: ChallengeSubmitted): void {
  const _request = getRequest(event.params.request);
  const _proposal = getRequestProposal(_request.id);
  const _proposerStats = getUserProposerStats(_proposal.proposer);
  const _challenge = getProposalChallenge(_request.id);
  const _user = getUser(event.params.challenger);
  const _challenger = getUserChallenger(_user.id);
  const _challengerStats = getUserChallengerStats(_challenger.stats);
  const _dashboard = getDashboard();

  const requestContract = RequestContract.bind(Address.fromBytes(_request.id));
  _request.status = requestContract.status();

  // enrich challenge
  _challenge.answer = event.params.answer;
  _challenge.reason = event.params.reason;
  _challenge.createdAt = event.block.timestamp;
  _challenge.challenger = _challenger.id;
  _challenge.proposal = _proposal.id;
  _challenge.request = _request.id;

  // enrich user
  _user.challenger = _challenger.id;

  // update challenger stats
  _challengerStats.challenges = _challengerStats.challenges.plus(INT32_ONE);
  _challengerStats.challengesActive =
    _challengerStats.challengesActive.plus(INT32_ONE);

  // update dashboard
  _dashboard.activeChallenges = _dashboard.activeChallenges.plus(INT32_ONE);

  // update proposer stats
  _proposerStats.challenged = _proposerStats.challenged.plus(INT32_ONE);

  // flag proposal as challenges
  _proposal.isChallenged = true;

  _proposal.save();
  _request.save();
  _challenge.save();
  _user.save();
  _challenger.save();
  _challengerStats.save();
  _proposerStats.save();
  _dashboard.save();
}

export function handleReviewSubmitted(event: ReviewSubmitted): void {
  const _request = getRequest(event.params.request);
  const _proposal = getRequestProposal(_request.id);
  const _challenge = getProposalChallenge(_request.id);
  const _review = getChallengeReview(_request.id.concat(event.params.reviewer));
  const _user = getUser(event.params.reviewer);
  const _reviewer = getUserReviewer(_user.id);
  const _reviewerStats = getUserReviewerStats(_reviewer.stats);

  // enrich review
  _review.reason = event.params.reason;
  _review.createdAt = event.block.timestamp;
  _review.supportsChallenge = event.params.supportsChallenge;
  _review.reviewer = _reviewer.id;
  _review.challenge = _challenge.id;
  _review.proposal = _proposal.id;
  _review.request = _request.id;

  // enrich user
  _user.reviewer = _reviewer.id;

  // update challenger stats
  _reviewerStats.reviews = _reviewerStats.reviews.plus(INT32_ONE);
  _reviewerStats.reviewsActive = _reviewerStats.reviewsActive.plus(INT32_ONE);

  // update challenge stats
  if (_review.supportsChallenge) {
    _challenge.votesFor = _challenge.votesFor.plus(INT32_ONE);
  } else {
    _challenge.votesAgainst = _challenge.votesAgainst.plus(INT32_ONE);
  }

  _challenge.save();
  _user.save();
  _review.save();
  _reviewer.save();
  _reviewerStats.save();
}

export function handleRequestResolved(event: RequestResolved): void {
  const _dashboard = getDashboard();
  const _request = getRequest(event.params.request);
  const _proposal = getRequestProposal(_request.id);
  const _proposerStats = getUserProposerStats(_proposal.proposer);
  const oracleContract = OracleCoordinator.bind(event.address);
  const requestContract = RequestContract.bind(Address.fromBytes(_request.id));

  const idFor = oracleContract.outcomeIdFor(Address.fromBytes(_request.id));
  const idAgainst = oracleContract.outcomeIdAgainst(
    Address.fromBytes(_request.id)
  );

  const outcomeFor = oracleContract.proposalChallengeOutcome(idFor);
  const outcomeAgainst = oracleContract.proposalChallengeOutcome(idAgainst);

  // update request with status and answer
  _request.status = requestContract.status();
  _request.answer = requestContract.answer();

  // reduce active proposals for proposer
  _proposerStats.proposalsActive =
    _proposerStats.proposalsActive.minus(INT32_ONE);

  if (!outcomeFor && !outcomeAgainst) {
    // not challenged at all
    _dashboard.proposalsSuccessful =
      _dashboard.proposalsSuccessful.plus(INT32_ONE);

    // increas successful proposal for proposer
    _proposerStats.successful = _proposerStats.successful.plus(INT32_ONE);
  } else {
    // only in here, there is a challenge
    const _challenge = getProposalChallenge(_request.id);
    const _challengerStats = getUserChallengerStats(_challenge.challenger);

    // reduce dashboard challenges
    _dashboard.activeChallenges = _dashboard.activeChallenges.minus(INT32_ONE);

    // reduce active challenges for challenger
    _challengerStats.challengesActive =
      _challengerStats.challengesActive.minus(INT32_ONE);

    if (outcomeFor) {
      // challenged and challenged won
      // add sucessful challenge
      _challengerStats.successful = _challengerStats.successful.plus(INT32_ONE);
    } else {
      // challenged and proposal won
      // increase successful proposal
      _dashboard.proposalsSuccessful =
        _dashboard.proposalsSuccessful.plus(INT32_ONE);

      // increase successful proposal for proposer
      _proposerStats.successful = _proposerStats.successful.plus(INT32_ONE);

      // increase challenged and won proposal for proposer
      _proposerStats.challenged = _proposerStats.challenged.plus(INT32_ONE);
    }

    // recalc success rate of challenger
    _challengerStats.successRate = divBigIntAndCreateTwoDigitDecimal(
      _challengerStats.successful,
      _challengerStats.challenges
    );

    _challengerStats.save();
  }

  // recalc success rate
  _dashboard.proposalSuccessRate = divBigIntAndCreateTwoDigitDecimal(
    _dashboard.proposalsSuccessful,
    _dashboard.proposals
  );

  // recalc success rate for proposer
  _proposerStats.successRate = divBigIntAndCreateTwoDigitDecimal(
    _proposerStats.successful,
    _proposerStats.proposals
  );

  _request.save();
  _proposerStats.save();
  _dashboard.save();
}

export function handleRewardDistributed(event: RewardDistributed): void {
  // gather earnings for users
  const _request = getRequest(event.params.request);
  const _proposal = getRequestProposal(_request.id);
  const _proposer = getUserProposerStats(_proposal.proposer);

  const _rewardedAmount = event.params.amount.toBigDecimal();

  if (
    !_proposal.isChallenged ||
    Address.fromBytes(_proposer.id) == event.params.recipient
  ) {
    // not challenged, only can be proposer receiving reward
    // or
    // challenged, but challenger has no supporters (technical draw), so the proposer wins
    _proposer.earnings = _proposer.earnings.plus(_rewardedAmount);
    _proposer.earningsInUSD = _proposer.earningsInUSD.plus(_rewardedAmount);
    _proposer.save();
  } else {
    const _user = User.load(event.params.recipient);
    if (_user !== null) {
      const _challenge = getProposalChallenge(_request.id);
      if (Address.fromBytes(_challenge.challenger) == event.params.recipient) {
        // reward given for challenger (cant be reviewer)
        const _challenger = getUserChallengerStats(_challenge.challenger);
        _challenger.earnings = _challenger.earnings.plus(_rewardedAmount);
        _challenger.earningsInUSD =
          _challenger.earningsInUSD.plus(_rewardedAmount);
        _challenger.save();
      } else {
        // reward given for reviewer
        const _reviewer = getUserReviewerStats(event.params.recipient);
        _reviewer.earnings = _reviewer.earnings.plus(_rewardedAmount);
        _reviewer.earningsInUSD = _reviewer.earningsInUSD.plus(_rewardedAmount);
        _reviewer.successful = _reviewer.successful.plus(INT32_ONE);
        _reviewer.reviewsActive = _reviewer.reviewsActive.minus(INT32_ONE);
        _reviewer.successRate = divBigIntAndCreateTwoDigitDecimal(
          _reviewer.successful,
          _reviewer.reviews
        );
        _reviewer.save();
      }
    } else {
      // only platform
    }
  }
}

export function handleBondRefunded(event: BondRefunded): void {
  // TODO later, not needed right now
}

///
/// --- HELPER FUNCTIONS ---
///

export function divBigIntAndCreateTwoDigitDecimal(
  a: BigInt,
  b: BigInt
): BigDecimal {
  return a
    .toBigDecimal()
    .div(b.toBigDecimal())
    .times(BigDecimal.fromString("10000"))
    .truncate(0)
    .div(BigDecimal.fromString("100"));
}
