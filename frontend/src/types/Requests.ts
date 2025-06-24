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
