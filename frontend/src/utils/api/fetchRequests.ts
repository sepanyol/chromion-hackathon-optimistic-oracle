import { gql } from "urql";
import { querySubgraph } from "./urqlClient";
import { RequestStatus } from "../helpers";
import {
  DashboardRequestType,
  FullRequestChallengeType,
  FullRequestReviewType,
  FullRequestType,
  RequestsForChallenge,
} from "@/types/Requests";

const FetchRequestsDefault = gql`
  query {
    requests(
      first: 10
      orderBy: createdAt
      orderDirection: asc
      where: { status_not: 4 }
    ) {
      id
      isCrossChain
      originChainId
      originAddress
      question
      answerType
      createdAt
      challengeWindow
      rewardAmount
      status
      scoring {
        final_decision
      }
      proposal {
        createdAt
        id
      }
      challenge {
        createdAt
        id
      }
    }
  }
`;

const FetchRequestsByStatus = gql`
  query ($status: Int) {
    requests(
      first: 10
      orderBy: createdAt
      orderDirection: asc
      where: { status_not: 4, status: $status }
    ) {
      id
      answerType
      challengeWindow
      createdAt
      isCrossChain
      originAddress
      originChainId
      question
      rewardAmount
      status
      scoring {
        final_decision
      }
      proposal {
        createdAt
        id
      }
      challenge {
        createdAt
        id
      }
    }
  }
`;
const FetchFullRequests = gql`
  query ($status: Int!) {
    requests(status: $status) {
      id
      answerType
      challengeWindow
      context
      createdAt
      isCrossChain
      originAddress
      originChainId
      question
      rewardAmount
      status
      truthMeaning
      scoring {
        final_decision
        score
        heatmap {
          ambiguity
          clarity
          completeness
          logical_consistency
          source_trust
          time_reference
        }
        ratings {
          ambiguity
          clarity
          completeness
          logical_consistency
          source_trust
          time_reference
        }
      }
      proposal {
        createdAt
        answer
        isChallenged
        proposer {
          id
        }
      }
      requester {
        id
      }
    }
  }
`;

export const fetchRequests = async (status?: RequestStatus | "all") =>
  querySubgraph<{ requests: DashboardRequestType[] }>(
    status ? FetchRequestsByStatus : FetchRequestsDefault,
    {
      ...(status != "all" ? { status } : {}),
    }
  );

const FetchRequestsForChallenge = gql<RequestsForChallenge, { status: number }>`
  query ($status: Int) {
    requests(where: { status: $status }) {
      id
      answerType
      challengeWindow
      context
      createdAt
      isCrossChain
      originAddress
      originChainId
      question
      rewardAmount
      status
      truthMeaning
      scoring {
        final_decision
        score
        heatmap {
          ambiguity
          clarity
          completeness
          logical_consistency
          source_trust
          time_reference
        }
        ratings {
          ambiguity
          clarity
          completeness
          logical_consistency
          source_trust
          time_reference
        }
      }
      proposal {
        createdAt
        answer
        isChallenged
        proposer {
          id
        }
      }
      challenge {
        createdAt
        answer
        reason
        votesAgainst
        votesFor
        challenger {
          id
        }
      }
      requester {
        id
      }
    }
  }
`;

export const fetchRequestsForChallenge = async () =>
  querySubgraph<RequestsForChallenge>(FetchRequestsForChallenge, {
    status: RequestStatus.Proposed,
  });
