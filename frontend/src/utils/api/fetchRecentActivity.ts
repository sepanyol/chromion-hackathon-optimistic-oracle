import { gql } from "urql";
import { querySubgraph } from "./urqlClient";

export const fetchRecentActivity = async () =>
  querySubgraph(gql`
    query {
      recentActivities(orderBy: createdAt, orderDirection: desc, first: 5) {
        activity
        createdAt
        request {
          id
          question
        }
        user {
          id
        }
        id
      }
    }
  `);
