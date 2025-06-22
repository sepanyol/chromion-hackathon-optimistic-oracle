import { gql } from "urql";
import { querySubgraph } from "./urqlClient";

export const fetchDashboard = async () =>
  querySubgraph(gql`
    query {
      dashboards(first: 1) {
        id
        totalRequests
        activeChallenges
        proposals
        proposalsFinishedSuccessful
        proposalsFinished
        proposalSuccessRate
      }
    }
  `);
