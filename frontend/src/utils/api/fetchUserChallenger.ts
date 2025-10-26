import { gql } from "urql";
import { Address } from "viem";
import { querySubgraph } from "./urqlClient";

export const fetchUserChallenger = async (address: Address) =>
  querySubgraph(
    gql`
      query ($id: Bytes) {
        userChallenger(id: $id) {
          id
          stats {
            challenges
            challengesActive
            earnings
            earningsInUSD
            successRate
            successful
          }
          challenges(
            where: { request_: { status_not: 4 } }
            orderBy: createdAt
            orderDirection: asc
          ) {
            reason
            votesFor
            votesAgainst
            answer
            createdAt
            request {
              question
              rewardAmount
              status
            }
          }
        }
        requests(
          where: { status: 2 }
          orderBy: proposal__createdAt
          orderDirection: asc
        ) {
          id
          status
          answerType
          challengeWindow
          context
          createdAt
          isCrossChain
          originAddress
          originChainId
          question
          rewardAmount
          truthMeaning
          scoring {
            final_decision
            score
            heatmap {
              ambiguity
              clarity
              completeness
              id
              logical_consistency
              source_trust
              time_reference
            }
            ratings {
              clarity
              ambiguity
              completeness
              id
              logical_consistency
              source_trust
              time_reference
            }
          }
          proposal {
            answer
            createdAt
            proposer {
              id
            }
          }
          requester {
            id
          }
          challenge {
            challenger {
              id
            }
          }
        }
        dashboard(
          id: "0x49465f594f555f524541445f544849535f57455f4152455f474f4f445f544f5f57494e5f5448455f4348524f4d494f4e5f4841434b4154484f4e"
        ) {
          proposals
          proposalsFinished
          activeChallenges
          challengeSuccessRate
          challenges
          challengesWon
        }
      }
    `,
    { id: address }
  );
