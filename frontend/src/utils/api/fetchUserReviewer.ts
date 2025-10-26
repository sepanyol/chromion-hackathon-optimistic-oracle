import { gql } from "urql";
import { Address } from "viem";
import { querySubgraph } from "./urqlClient";

export const fetchUserReviewer = async (address: Address) =>
  querySubgraph(
    gql`
      query ($id: Bytes) {
        userReviewer(id: $id) {
          reviews(first: 5) {
            id
            createdAt
            reason
            supportsChallenge
            request {
              question
              createdAt
              id
              status
            }
            challenge {
              answer
              createdAt
              reason
              votesFor
              votesAgainst
              challenger {
                id
              }
            }
            proposal {
              proposer {
                id
              }
            }
          }
          stats {
            successful
            successRate
            reviewsActive
            reviews
            earningsInUSD
            earnings
            agreementRate
            agreementApprovalRate
            agreementApproval
          }
        }
        dashboard(
          id: "0x49465f594f555f524541445f544849535f57455f4152455f474f4f445f544f5f57494e5f5448455f4348524f4d494f4e5f4841434b4154484f4e"
        ) {
          activeChallenges
        }
      }
    `,
    { id: address }
  );
