export type ActivityItemStatus =
  | "Created"
  | "Proposed"
  | "Challenged"
  | "Reviewed"
  | "Resolved";

export interface ActivityItem {
  id: string;
  title: string;
  user: string | null;
  time: string;
  status: ActivityItemStatus;
}
