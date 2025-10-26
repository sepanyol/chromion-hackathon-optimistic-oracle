import { gql } from "urql";
import { querySubgraph } from "./urqlClient";
import { Address } from "viem";

export const fetchUserProposer = async (address: Address) =>
  querySubgraph(
    gql`
      query ($id: Bytes) {
        userProposer(id: $id) {
          id
          stats {
            challenged
            earnings
            earningsInUSD
            proposals
            proposalsActive
            successRate
            successful
          }
          proposals {
            answer
            createdAt
            isChallenged
            request {
              id
              question
              status
              answer
              rewardAmount
              answerType
              challengeWindow
              scoring {
                score
                final_decision
              }
            }
          }
        }
        dashboard(
          id: "0x49465f594f555f524541445f544849535f57455f4152455f474f4f445f544f5f57494e5f5448455f4348524f4d494f4e5f4841434b4154484f4e"
        ) {
          proposals
          totalRequests
        }
        requests(where: { status: 1 }) {
          id
          answerType
          context
          createdAt
          isCrossChain
          originChainId
          question
          rewardAmount
          status
          scoring {
            score
            final_decision
          }
        }
      }
    `,
    { id: address }
  );
