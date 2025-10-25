import { MyWrappedNftsType } from "@/types/WrappedNFT";
import { fetchMyWrappedNfts } from "@/utils/api/fetchMyWrappedNfts";
import { useQuery } from "@tanstack/react-query";
import { Address, zeroAddress } from "viem";

type UseMyWrappedNftsProps = {
  account: Address | undefined;
};

export const useMyWrappedNfts = ({ account }: UseMyWrappedNftsProps) =>
  useQuery({
    queryKey: ["my-wrapped-nfts", account],
    queryFn: async () => await fetchMyWrappedNfts(account || zeroAddress),
    select: (result) =>
      result && result.data && result.data.wrappedNFTs
        ? result.data.wrappedNFTs
        : null,
    // queryFn: async () =>
    //   Promise.resolve({
    //     data: {
    //       wrappedNFTs: [
    //         {
    //           id: "0x11",
    //           blockTimestamp: BigInt(1234512345),
    //           originId: BigInt(1),
    //           originNFT: "0x1234567890123456789012345678901234567890",
    //           requester: "0x1234567890123456789012345678901234567890",
    //           wNft: BigInt(1),
    //         },
    //         {
    //           id: "0x12",
    //           blockTimestamp: BigInt(1234512345),
    //           originId: BigInt(1),
    //           originNFT: "0x1234567890123456789012345678901234567890",
    //           requester: "0x1234567890123456789012345678901234567890",
    //           wNft: BigInt(1),
    //         },
    //         {
    //           id: "0x13",
    //           blockTimestamp: BigInt(1234512345),
    //           originId: BigInt(1),
    //           originNFT: "0x1234567890123456789012345678901234567890",
    //           requester: "0x1234567890123456789012345678901234567890",
    //           wNft: BigInt(1),
    //         },
    //       ],
    //     } as MyWrappedNftsType,
    //   }),
    // select: (result: { data: MyWrappedNftsType }) =>
    //   result && result.data && result.data.wrappedNFTs
    //     ? result.data.wrappedNFTs
    //     : null,
    enabled: !!account,
  });
