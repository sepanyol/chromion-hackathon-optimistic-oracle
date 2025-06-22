export type StatData = {
  title: string;
  value: string;
  change: string | null;
  changeType: "positive" | "negative" | null;
  icon: React.ReactNode;
};
