import { Address } from "viem";
import { FullRequestType } from "./Requests";

export type WrappedNFTValuationType = {
  request: FullRequestType;
  nft: FullWrappedNFTType;
  amount: bigint;
  asset: Address;
};

export type FullWrappedNFTType = {
  id: Address;
  requester: Address;
  originNFT: Address;
  wNft: bigint;
  originId: bigint;
  blockNumber: bigint;
  blockTimestamp: bigint;
  transactionHash: Address;
  valuations: WrappedNFTValuationType[];
  currentValuation: WrappedNFTValuationType;
};

export type MyWrappedNftType = Omit<
  FullWrappedNFTType,
  "transactionHash" | "blockNumber" | "valuations"
> & {
  currentValuation: Omit<WrappedNFTValuationType, "id">;
};

export type MyWrappedNftsType = { wrappedNFTs: MyWrappedNftType[] };
