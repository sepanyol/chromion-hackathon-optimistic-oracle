import abi from "@/abis/factory.json";
import { getFactoryByChainId, getUSDCByChainId } from "@/utils/contracts";
import { useAppKitAccount, useAppKitNetwork } from "@reown/appkit/react";
import { Address, pad, toHex } from "viem";
import { useExecuteFunctionWithTokenTransfer } from "./useExecuteFunctionWithTokenTransfer";

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

export const useCreateRequest = ({
  params,
  onEventMatch,
}: useCreateRequestProps) => {
  const { address } = useAppKitAccount();
  const { chainId } = useAppKitNetwork();

  // mandatory
  if (params) params.requester = pad(address as Address);

  return useExecuteFunctionWithTokenTransfer({
    address: getFactoryByChainId(Number(chainId)),
    abi: abi as any,
    account: address as Address,
    functionName: "createRequest",
    args: [params],
    chainId: Number(chainId),
    eventNames: ["RequestCreated"],
    transferToken: getUSDCByChainId(Number(chainId)),
    transferAmount: params ? BigInt(Number(params?.rewardAmount)) : BigInt(0),
    enabled: Boolean(
      params &&
        params.requester &&
        params.question &&
        params.context &&
        params.challengeWindow > 0 &&
        params.rewardAmount > 0 &&
        (params.answerType === 0 || params.answerType === 1) // TODO make nice
    ),
    ...(onEventMatch ? { onEventMatch } : {}),
  });
};
