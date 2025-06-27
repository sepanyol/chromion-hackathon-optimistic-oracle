import { gql } from "urql";
import { querySubgraph } from "./urqlClient";
import { RequestStatus } from "../helpers";
import { DashboardRequestType } from "@/types/Requests";

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

export const fetchRequests = async (status?: RequestStatus | "all") =>
  querySubgraph<{ requests: DashboardRequestType[] }>(
    status ? FetchRequestsByStatus : FetchRequestsDefault,
    {
      ...(status != "all" ? { status } : {}),
    }
  );
