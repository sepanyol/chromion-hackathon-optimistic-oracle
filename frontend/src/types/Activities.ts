import { Address } from "viem";

export type ActivityItemStatus =
  | "Created"
  | "Proposed"
  | "Challenged"
  | "Reviewed"
  | "Resolved";

export interface ActivityItem {
  id: string;
  title: string;
  user: Address | null;
  time: string;
  status: ActivityItemStatus;
}
