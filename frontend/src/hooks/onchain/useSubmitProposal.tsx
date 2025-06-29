"use client";
import abi from "@/abis/coordinator.json";
import { defaultChain } from "@/utils/appkit/context";
import { getOracleByChainId, getUSDCByChainId } from "@/utils/contracts";
import { Abi, Address, isAddress, isHex, parseUnits } from "viem";
import { useAccount } from "wagmi";
import { useExecuteFunctionWithTokenTransfer } from "./useExecuteFunctionWithTokenTransfer";

type useSubmitProposalProps = {
  request: Address;
  answer: any;
};

export const useSubmitProposal = ({
  request,
  answer,
}: useSubmitProposalProps) => {
  const { address: account } = useAccount();
  const address = getOracleByChainId(defaultChain.id)!;
  const chainId = defaultChain.id;
  return useExecuteFunctionWithTokenTransfer({
    address,
    abi: abi as Abi,
    account: account as Address,
    functionName: "proposeAnswer",
    args: [request, answer],
    chainId,
    eventNames: ["AnswerProposed"],
    transferToken: getUSDCByChainId(defaultChain.id),
    transferAmount: BigInt(parseUnits("100", 6)),
    enabled: Boolean(isAddress(request) && isHex(answer)),
  });
};
