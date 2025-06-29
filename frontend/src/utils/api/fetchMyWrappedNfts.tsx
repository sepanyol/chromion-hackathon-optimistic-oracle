import { MyWrappedNftsType } from "@/types/WrappedNFT";
import { gql } from "urql";
import { Address } from "viem";
import { querySubgraph } from "./urqlClient";

export const fetchMyWrappedNfts = async (requester: Address) =>
  querySubgraph<MyWrappedNftsType>(
    gql`
      query ($requester: Bytes) {
        wrappedNFTs(
          where: { requester: $requester }
          orderBy: blockTimestamp
          orderDirection: desc
        ) {
          id
          requester
          wNft
          originNFT
          originId
          blockTimestamp
        }
      }
    `,
    {
      requester,
    }
  );
