import { Address } from "viem";

export type FullWrappedNFTType = {
  id: Address;
  requester: Address;
  originNFT: Address;
  wNft: bigint;
  originId: bigint;
  blockNumber: bigint;
  blockTimestamp: bigint;
  transactionHash: Address;
};
export type MyWrappedNftType = Omit<
  FullWrappedNFTType,
  "transactionHash" | "blockNumber"
>;
export type MyWrappedNftsType = { wrappedNFTs: MyWrappedNftType[] };
