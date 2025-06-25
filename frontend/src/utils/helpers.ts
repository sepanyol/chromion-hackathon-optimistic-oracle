export enum RequestStatus {
  Pending,
  Open,
  Proposed,
  Challenged,
  Resolved,
  Failed,
}

export type ReadableRequestStatus =
  | "Pending"
  | "Open"
  | "Proposed"
  | "Challenged"
  | "Resolved"
  | "Failed";

export type ReadableRequestStatusForOpposition =
  | "Not Open"
  | "Unproposed"
  | "Unchallenged"
  | "Unresolved"
  | "Resolved"
  | "Failed";

export const getReadableRequestStatus = (
  status: RequestStatus
): ReadableRequestStatus => {
  switch (status) {
    default:
    case RequestStatus.Pending:
      return "Pending";
    case RequestStatus.Open:
      return "Open";
    case RequestStatus.Proposed:
      return "Proposed";
    case RequestStatus.Challenged:
      return "Challenged";
    case RequestStatus.Resolved:
      return "Resolved";
    case RequestStatus.Failed:
      return "Failed";
  }
};
export const getReadableRequestStatusForOpposition = (
  status: RequestStatus
): ReadableRequestStatusForOpposition => {
  switch (status) {
    default:
    case RequestStatus.Pending:
      return "Not Open";
    case RequestStatus.Open:
      return "Unproposed";
    case RequestStatus.Proposed:
      return "Unchallenged";
    case RequestStatus.Challenged:
      return "Unresolved";
    case RequestStatus.Resolved:
      return "Resolved";
    case RequestStatus.Failed:
      return "Failed";
  }
};
