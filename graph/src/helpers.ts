import { BigDecimal, BigInt, ByteArray, Bytes } from "@graphprotocol/graph-ts";
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

export const INT32_ONE = BigInt.fromI32(1);
export const INT32_ZERO = BigInt.fromI32(0);
export const EMPTY_BYTES = Bytes.fromI32(0);

export function getDashboard(): Dashboard {
  const _id = Bytes.fromByteArray(
    ByteArray.fromUTF8(
      "IF_YOU_READ_THIS_WE_ARE_GOOD_TO_WIN_THE_CHROMION_HACKATHON"
    )
  );
  let _dashboard = Dashboard.load(_id);
  if (_dashboard === null) {
    _dashboard = new Dashboard(_id);
    _dashboard.totalRequests = INT32_ZERO;
    _dashboard.activeChallenges = INT32_ZERO;
    _dashboard.proposals = INT32_ZERO;
    _dashboard.proposalsSuccessful = INT32_ZERO;
    _dashboard.proposalSuccessRate = BigDecimal.fromString("0");
  }
  return _dashboard;
}

export function getUser(address: Bytes): User {
  let _user = User.load(address);
  if (_user === null) {
    _user = new User(address);
    _user.createdAt = 0;
    _user.updatedAt = 0;
  }
  return _user;
}

export function getUserRequester(address: Bytes): UserRequester {
  let _userRequester = UserRequester.load(address);
  if (_userRequester === null) {
    _userRequester = new UserRequester(address);
    const _stats = getUserRequesterStats(_userRequester.id);
    _userRequester.stats = _stats.id;
  }
  return _userRequester;
}

export function getUserRequesterStats(address: Bytes): UserRequesterStats {
  let _stats = UserRequesterStats.load(address);
  if (_stats === null) {
    _stats = new UserRequesterStats(address);
    _stats.requests = INT32_ZERO;
    _stats.requestsActive = INT32_ZERO;
    _stats.successful = INT32_ZERO;
    _stats.successRate = BigDecimal.fromString("0");
    _stats.requestAvgResolution = BigDecimal.fromString("0");
  }
  return _stats;
}

export function getUserProposer(address: Bytes): UserProposer {
  let _userProposer = UserProposer.load(address);
  if (_userProposer === null) {
    _userProposer = new UserProposer(address);
    const _stats = getUserProposerStats(_userProposer.id);
    _userProposer.stats = _stats.id;
  }
  return _userProposer;
}

export function getUserProposerStats(address: Bytes): UserProposerStats {
  let _stats = UserProposerStats.load(address);
  if (_stats === null) {
    _stats = new UserProposerStats(address);
    _stats.proposals = INT32_ZERO;
    _stats.proposalsActive = INT32_ZERO;
    _stats.successful = INT32_ZERO;
    _stats.challenged = INT32_ZERO;
    _stats.successRate = BigDecimal.fromString("0");
    _stats.earnings = BigDecimal.fromString("0");
    _stats.earningsInUSD = BigDecimal.fromString("0");
  }
  return _stats;
}

export function getUserChallenger(address: Bytes): UserChallenger {
  let _userChallenger = UserChallenger.load(address);
  if (_userChallenger === null) {
    _userChallenger = new UserChallenger(address);
    const _stats = getUserChallengerStats(_userChallenger.id);
    _userChallenger.stats = _stats.id;
  }
  return _userChallenger;
}

export function getUserChallengerStats(address: Bytes): UserChallengerStats {
  let _stats = UserChallengerStats.load(address);
  if (_stats === null) {
    _stats = new UserChallengerStats(address);
    _stats.challenges = INT32_ZERO;
    _stats.challengesActive = INT32_ZERO;
    _stats.successful = INT32_ZERO;
    _stats.successRate = BigDecimal.fromString("0");
    _stats.earnings = BigDecimal.fromString("0");
    _stats.earningsInUSD = BigDecimal.fromString("0");
  }
  return _stats;
}

export function getUserReviewer(address: Bytes): UserReviewer {
  let _userReviewer = UserReviewer.load(address);
  if (_userReviewer === null) {
    _userReviewer = new UserReviewer(address);
    const _stats = getUserReviewerStats(_userReviewer.id);
    _userReviewer.stats = _stats.id;
  }
  return _userReviewer;
}

export function getUserReviewerStats(address: Bytes): UserReviewerStats {
  let _stats = UserReviewerStats.load(address);
  if (_stats === null) {
    _stats = new UserReviewerStats(address);
    _stats.reviews = INT32_ZERO;
    _stats.reviewsActive = INT32_ZERO;
    _stats.successful = INT32_ZERO;
    _stats.successRate = BigDecimal.fromString("0");
    _stats.earnings = BigDecimal.fromString("0");
    _stats.earningsInUSD = BigDecimal.fromString("0");
    _stats.agreementApproval = INT32_ZERO;
    _stats.agreementApprovalRate = BigDecimal.fromString("0");
    _stats.agreementRate = BigDecimal.fromString("0");
  }
  return _stats;
}

export function getRequest(address: Bytes): Request {
  let _request = Request.load(address);
  if (_request === null) {
    _request = new Request(address);
    _request.challengeWindow = INT32_ZERO;
    _request.createdAt = 0;
    _request.answerType = 0;
    _request.question = "";
    _request.context = "";
    _request.answer = null;
    _request.isCrossChain = false;
    _request.status = 0;
    _request.truthMeaning = "";
    _request.originAddress = EMPTY_BYTES;
    _request.originChainId = EMPTY_BYTES;
    _request.rewardAmount = INT32_ZERO;
  }
  return _request;
}

export function getRequestProposal(id: Bytes): RequestProposal {
  let _proposal = RequestProposal.load(id);
  if (_proposal === null) {
    _proposal = new RequestProposal(id);
    _proposal.createdAt = 0;
    _proposal.answer = EMPTY_BYTES;
    _proposal.isChallenged = false;
  }
  return _proposal;
}

export function getProposalChallenge(id: Bytes): ProposalChallenge {
  let _challenge = ProposalChallenge.load(id);
  if (_challenge === null) {
    _challenge = new ProposalChallenge(id);
    _challenge.createdAt = 0;
    _challenge.answer = EMPTY_BYTES;
    _challenge.reason = EMPTY_BYTES;
    _challenge.votesFor = INT32_ZERO;
    _challenge.votesAgainst = INT32_ZERO;
  }
  return _challenge;
}

export function getChallengeReview(id: Bytes): ChallengeReview {
  let _review = ChallengeReview.load(id);
  if (_review === null) {
    _review = new ChallengeReview(id);
    _review.createdAt = 0;
    _review.reason = EMPTY_BYTES;
  }
  return _review;
}
