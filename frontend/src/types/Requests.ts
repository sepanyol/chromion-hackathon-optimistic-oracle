import { ReadableRequestStatus, RequestStatus } from "@/utils/helpers";

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
  reward: string;
}
