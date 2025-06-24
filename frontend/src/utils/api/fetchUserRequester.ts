import { gql } from "urql";
import { querySubgraph } from "./urqlClient";
import { Address } from "viem";

export const fetchUserRequester = async (address: Address) =>
  querySubgraph(
    gql`
      query ($id: Bytes) {
        userRequester(id: $id) {
          id
          requests(first: 10, orderBy: createdAt, orderDirection: desc) {
            id
            scoring {
              score
              final_decision
            }
            status
            rewardAmount
            question
          }
          stats {
            requestAvgResolution
            requests
            requestsActive
            successRate
            successful
          }
        }
      }
    `,
    { id: address }
  );
