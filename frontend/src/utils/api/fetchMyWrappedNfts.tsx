import { MyWrappedNftsType } from "@/types/WrappedNFT";
import { gql } from "urql";
import { Address } from "viem";
import { querySubgraph } from "./urqlClient";

export const fetchMyWrappedNfts = async (requester: Address) =>
  querySubgraph<MyWrappedNftsType>(
    gql`
      query ($requester: Bytes!) {
        wrappedNFT(where: { requester: $requester }) {
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
