import { AvailableReviewsType } from "@/types/Requests";
import { gql } from "urql";
import { querySubgraph } from "./urqlClient";

export const fetchAvailableReviews = async () =>
  querySubgraph<{ proposalChallenges: AvailableReviewsType[] }>(gql`
    query {
      proposalChallenges(where: { request_: { status: 3 } }) {
        answer
        createdAt
        id
        reason
        votesAgainst
        votesFor
        challenger {
          id
        }
        proposal {
          answer
          proposer {
            id
          }
        }
        request {
          answerType
          context
          createdAt
          question
          rewardAmount
          truthMeaning
          scoring {
            final_decision
            score
          }
          requester {
            id
          }
        }
      }
    }
  `);
