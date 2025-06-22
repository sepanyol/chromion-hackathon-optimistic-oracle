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
