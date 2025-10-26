export type FullDashboardType = {
  id: string;
  activeChallenges: number;
  challengeSuccessRate: number;
  challenges: number;
  challengesWon: number;
  proposalSuccessRate: number;
  proposals: number;
  proposalsFinished: number;
  proposalsFinishedSuccessful: number;
  totalRequests: number;
};

export type DashboardType = Omit<
  FullDashboardType,
  "challengeSuccessRate" | "challenges" | "challengesWon"
>;
