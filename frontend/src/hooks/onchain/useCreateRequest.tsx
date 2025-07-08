import abi from "@/abis/factory.json";
import { getFactoryByChainId, getUSDCByChainId } from "@/utils/contracts";
import { Address, pad, toHex } from "viem";

import {
  useEvmClients,
  useEvmTransactionFlow,
} from "@s3panyol/use-evm-transaction-flow";

export type CreateNFTRequestParams = {
  context: string;
  originId: bigint;
  originNFT: Address;
};

export type CreateRequestParams = {
  requester: Address; // bytes
  originAddress: Address; // bytes
  originChainId: Address; // bytes
  answerType: 0 | 1; // 0 = Bool, 1 = Value
  challengeWindow: number;
  rewardAmount: bigint;
  question: string;
  context: string;
  truthMeaning: string;
  isCrossChain: boolean;
};

export type InputCreateRequestParams = Pick<
  CreateRequestParams,
  | "answerType"
  | "challengeWindow"
  | "rewardAmount"
  | "question"
  | "context"
  | "truthMeaning"
>;

export const generateCreateRequestParams = (
  params: InputCreateRequestParams
): CreateRequestParams => ({
  ...params,
  requester: toHex(""),
  originAddress: toHex(""),
  originChainId: toHex(""),
  isCrossChain: false,
});

type useCreateRequestProps = {
  params: CreateRequestParams | null;
  onEventMatch?: (event: any) => void;
};

export type InputNFTCreateRequestParams = {
  originId: bigint;
  originNFT: Address;
  context: string;
};

export const useCreateRequest = ({
  params,
  onEventMatch,
}: useCreateRequestProps) => {
  const { account: address, walletClient } = useEvmClients();

  // mandatory
  if (params && address) params.requester = pad(address as Address);

  const factoryAddress = getFactoryByChainId(Number(walletClient?.chain.id));
  const tokenAddress = getUSDCByChainId(Number(walletClient?.chain.id));
  return useEvmTransactionFlow({
    abi: abi as any,
    args: [params],
    contractAddress: factoryAddress,
    functionName: "createRequest",
    tokenAddress,
    tokenType: "ERC20",
    amount: params ? BigInt(Number(params?.rewardAmount)) : BigInt(0),
    spender: factoryAddress,
  });
};
