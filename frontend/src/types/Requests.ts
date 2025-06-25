import { ReadableRequestStatus, RequestStatus } from "@/utils/helpers";
import { Address } from "viem";

export interface ActiveRequest {
  id: string;
  request: string;
  type: string;
  reward: string;
  status: RequestStatus;
  statusLabel: ReadableRequestStatus;
  timeLeft: string;
  requestedTime: string;
}

export interface MyRequestsType {
  id: string;
  question: string;
  description: string;
  status: ReadableRequestStatus;
  reward: string;
  timeAgo: string;
  chains: string[] | null;
}

export interface SolverRequestsType {
  id: string;
  title: string;
  description: string;
  chain: string;
  reward: string;
  bondRequired: string;
  riskScore: 0 | 1 | 2 | 3;
  createdAt: string;
  category: string;
}

export interface SolverProposalsType {
  id: string;
  question: string;
  status: string;
  created: string;
  challengePeriod: string;
  reward: string;
}
export type FullScoringType = {
  final_decision: number;
  score: number;
  heatmap: {
    ambiguity: number;
    clarity: number;
    completeness: number;
    logical_consistency: number;
    source_trust: number;
    time_reference: number;
  };
  ratings: {
    ambiguity: number;
    clarity: number;
    completeness: number;
    logical_consistency: number;
    source_trust: number;
    time_reference: number;
  };
};

export type FullRequestType = {
  id: Address;
  answerType: 0 | 1;
  challengeWindow: number;
  context: string;
  createdAt: number;
  isCrossChain: boolean;
  originAddress: string;
  originChainId: string;
  question: string;
  rewardAmount: bigint;
  status: RequestStatus;
  truthMeaning: string;
  scoring: FullScoringType;
  requester: {
    id: Address;
  };
};

export type FullRequestProposalType = {
  proposal: {
    createdAt: number;
    answer: string;
    isChallenged: boolean;
  };
} & FullRequestType;

export type FullRequestChallengeType = {
  proposal: {
    proposer: {
      id: Address;
    };
    createdAt: number;
    answer: string;
    isChallenged: boolean;
  };
} & FullRequestType;
