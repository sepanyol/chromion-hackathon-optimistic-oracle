import {
  Address,
  BigDecimal,
  BigInt,
  ByteArray,
  Bytes,
  crypto,
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
import {
  ChallengeReview,
  Dashboard,
  ProposalChallenge,
  Request,
  RequestProposal,
  User,
  UserChallenger,
  UserChallengerStats,
  UserProposer,
  UserProposerStats,
  UserRequester,
  UserRequesterStats,
  UserReviewer,
  UserReviewerStats,
} from "../generated/schema";
import { RequestContract } from "../generated/templates/RequestContract/RequestContract";

export function handleRequestRegistered(event: RequestRegistered): void {
  const _request = getRequest(event.params.request);
  const _user = getUser(event.params.requester);
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
  _request.answer = requestContract.answer();
  _request.truthMeaning = requestContract.truthMeaning();
  _request.isCrossChain = !requestContract.isOracleChain();
  _request.createdAt = requestContract.createdAt().toI64();
  _request.status = requestContract.status();

  // connect user with requester
  _user.requester = _requester.id;

  // connect request with requester
  _request.requester = _requester.id;

  // count stats
  _requesterStats.requests = _requesterStats.requests.plus(BigInt.fromI32(1));
  _requesterStats.requestsActive = _requesterStats.requestsActive.plus(
    BigInt.fromI32(1)
  );

  // update dashboard
  _dashboard.totalRequests = _dashboard.totalRequests.plus(BigInt.fromI32(1));

  _dashboard.save();
  _requesterStats.save();
  _requester.save();
  _request.save();
  _user.save();
}

export function handleAnswerProposed(event: AnswerProposed): void {
  const _request = getRequest(event.params.request);
  const _proposal = getRequestProposal(event.params.request);
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
  _proposal.createdAt = event.block.timestamp.toI64();

  // enrich proposer
  _proposer.stats = _proposerStats.id;

  // enrich user
  _user.proposer = _proposer.id;

  // update proposer stats
  _proposerStats.proposals = _proposerStats.proposals.plus(BigInt.fromI32(1));
  _proposerStats.proposalsActive = _proposerStats.proposals.plus(
    BigInt.fromI32(1)
  );

  // update dashboard
  _dashboard.proposals = _dashboard.proposals.plus(BigInt.fromI32(1));

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
  _challenge.createdAt = event.block.timestamp.toI64();
  _challenge.challenger = _challenger.id;
  _challenge.proposal = _proposal.id;
  _challenge.request = _request.id;

  // enrich user
  _user.challenger = _challenger.id;

  // update challenger stats
  _challengerStats.challenges = _challengerStats.challenges.plus(
    BigInt.fromI32(1)
  );
  _challengerStats.challengesActive = _challengerStats.challengesActive.plus(
    BigInt.fromI32(1)
  );

  // update dashboard
  _dashboard.activeChallenges = _dashboard.activeChallenges.plus(
    BigInt.fromI32(1)
  );

  _request.save();
  _challenge.save();
  _user.save();
  _challenger.save();
  _challengerStats.save();
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
  _review.createdAt = event.block.timestamp.toI64();
  _review.supportsChallenge = event.params.supportsChallenge;
  _review.reviewer = _reviewer.id;
  _review.challenge = _challenge.id;
  _review.proposal = _proposal.id;
  _review.request = _request.id;

  // enrich user
  _user.reviewer = _reviewer.id;

  // update challenger stats
  _reviewerStats.reviews = _reviewerStats.reviews.plus(BigInt.fromI32(1));
  _reviewerStats.reviewsActive = _reviewerStats.reviewsActive.plus(
    BigInt.fromI32(1)
  );

  // update challenge stats
  if (_review.supportsChallenge) {
    _challenge.votesFor = _challenge.votesFor.plus(BigInt.fromI32(1));
  } else {
    _challenge.votesAgainst = _challenge.votesAgainst.plus(BigInt.fromI32(1));
  }

  _challenge.save();
  _user.save();
  _review.save();
  _reviewer.save();
  _reviewerStats.save();
}

export function handleRequestResolved(event: RequestResolved): void {
  // const _request = getRequest(event.params.request);
  // const _dashboard = getDashboard();
  // const oracle = OracleCoordinator.bind(event.address);

  // const requestContract = RequestContract.bind(Address.fromBytes(_request.id));
  // _request.status = requestContract.status();



  // // _dashboard.
}

export function handleBondRefunded(event: BondRefunded): void {}

export function handleRewardDistributed(event: RewardDistributed): void {}

///
/// --- HELPER FUNCTIONS ---
///

function getDashboard(): Dashboard {
  const _id = Bytes.fromByteArray(
    ByteArray.fromUTF8(
      "IF_YOU_READ_THIS_WE_ARE_GOOD_TO_WIN_THE_CHROMION_HACKATHON"
    )
  );
  let _dashboard = Dashboard.load(_id);
  if (_dashboard === null) {
    _dashboard = new Dashboard(_id);
    _dashboard.totalRequests = BigInt.fromI32(0);
    _dashboard.activeChallenges = BigInt.fromI32(0);
    _dashboard.proposals = BigInt.fromI32(0);
    _dashboard.proposalsSuccessful = BigInt.fromI32(0);
    _dashboard.proposalSuccessRate = BigDecimal.fromString("0");
  }
  return _dashboard;
}

function getUser(address: Bytes): User {
  let _user = User.load(address);
  if (_user === null) {
    _user = new User(address);
    _user.createdAt = 0;
    _user.updatedAt = 0;
  }
  return _user;
}

function getUserRequester(address: Bytes): UserRequester {
  let _userRequester = UserRequester.load(address);
  if (_userRequester === null) {
    _userRequester = new UserRequester(address);
    const _stats = getUserRequesterStats(_userRequester.id);
    _userRequester.stats = _stats.id;
  }
  return _userRequester;
}

function getUserRequesterStats(address: Bytes): UserRequesterStats {
  let _stats = UserRequesterStats.load(address);
  if (_stats === null) {
    _stats = new UserRequesterStats(address);
    _stats.requests = BigInt.fromI32(0);
    _stats.requestsActive = BigInt.fromI32(0);
    _stats.successful = BigInt.fromI32(0);
    _stats.successRate = BigDecimal.fromString("0");
    _stats.requestAvgResolution = BigDecimal.fromString("0");
  }
  return _stats;
}

function getUserProposer(address: Bytes): UserProposer {
  let _userProposer = UserProposer.load(address);
  if (_userProposer === null) {
    _userProposer = new UserProposer(address);
    const _stats = getUserProposerStats(_userProposer.id);
    _userProposer.stats = _stats.id;
  }
  return _userProposer;
}

function getUserProposerStats(address: Bytes): UserProposerStats {
  let _stats = UserProposerStats.load(address);
  if (_stats === null) {
    _stats = new UserProposerStats(address);
    _stats.proposals = BigInt.fromI32(0);
    _stats.proposalsActive = BigInt.fromI32(0);
    _stats.successful = BigInt.fromI32(0);
    _stats.challenged = BigInt.fromI32(0);
    _stats.successRate = BigDecimal.fromString("0");
    _stats.earnings = BigDecimal.fromString("0");
    _stats.earningsInUSD = BigDecimal.fromString("0");
  }
  return _stats;
}

function getUserChallenger(address: Bytes): UserChallenger {
  let _userChallenger = UserChallenger.load(address);
  if (_userChallenger === null) {
    _userChallenger = new UserChallenger(address);
    const _stats = getUserChallengerStats(_userChallenger.id);
    _userChallenger.stats = _stats.id;
  }
  return _userChallenger;
}

function getUserChallengerStats(address: Bytes): UserChallengerStats {
  let _stats = UserChallengerStats.load(address);
  if (_stats === null) {
    _stats = new UserChallengerStats(address);
    _stats.challenges = BigInt.fromI32(0);
    _stats.challengesActive = BigInt.fromI32(0);
    _stats.successful = BigInt.fromI32(0);
    _stats.successRate = BigDecimal.fromString("0");
    _stats.earnings = BigDecimal.fromString("0");
    _stats.earningsInUSD = BigDecimal.fromString("0");
  }
  return _stats;
}

function getUserReviewer(address: Bytes): UserReviewer {
  let _userReviewer = UserReviewer.load(address);
  if (_userReviewer === null) {
    _userReviewer = new UserReviewer(address);
    const _stats = getUserReviewerStats(_userReviewer.id);
    _userReviewer.stats = _stats.id;
  }
  return _userReviewer;
}

function getUserReviewerStats(address: Bytes): UserReviewerStats {
  let _stats = UserReviewerStats.load(address);
  if (_stats === null) {
    _stats = new UserReviewerStats(address);
    _stats.reviews = BigInt.fromI32(0);
    _stats.reviewsActive = BigInt.fromI32(0);
    _stats.successful = BigInt.fromI32(0);
    _stats.successRate = BigDecimal.fromString("0");
    _stats.earnings = BigDecimal.fromString("0");
    _stats.earningsInUSD = BigDecimal.fromString("0");
    _stats.agreementApproval = BigInt.fromI32(0);
    _stats.agreementApprovalRate = BigDecimal.fromString("0");
    _stats.agreementRate = BigDecimal.fromString("0");
  }
  return _stats;
}

function getRequest(address: Bytes): Request {
  let _request = Request.load(address);
  if (_request === null) {
    _request = new Request(address);
    _request.challengeWindow = BigInt.fromI32(0);
    _request.createdAt = 0;
    _request.answerType = 0;
    _request.question = "";
    _request.context = "";
    _request.answer = null;
    _request.isCrossChain = false;
    _request.status = 0;
    _request.truthMeaning = "";
    _request.originAddress = Bytes.fromI32(0);
    _request.originChainId = Bytes.fromI32(0);
    _request.rewardAmount = BigInt.fromI32(0);
  }
  return _request;
}

function getRequestProposal(id: Bytes): RequestProposal {
  let _proposal = RequestProposal.load(id);
  if (_proposal === null) {
    _proposal = new RequestProposal(id);
    _proposal.createdAt = 0;
    _proposal.answer = Bytes.fromI32(0);
    _proposal.isChallenged = false;
  }
  return _proposal;
}

function getProposalChallenge(id: Bytes): ProposalChallenge {
  let _challenge = ProposalChallenge.load(id);
  if (_challenge === null) {
    _challenge = new ProposalChallenge(id);
    _challenge.createdAt = 0;
    _challenge.answer = Bytes.fromI32(0);
    _challenge.reason = Bytes.fromI32(0);
    _challenge.votesFor = BigInt.fromI32(0);
    _challenge.votesAgainst = BigInt.fromI32(0);
  }
  return _challenge;
}

function getChallengeReview(id: Bytes): ChallengeReview {
  let _review = ChallengeReview.load(id);
  if (_review === null) {
    _review = new ChallengeReview(id);
    _review.createdAt = 0;
    _review.reason = Bytes.fromI32(0);
  }
  return _review;
}
