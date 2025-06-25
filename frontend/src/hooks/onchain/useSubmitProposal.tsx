import abi from "@/abis/coordinator.json";
import {
  getFactoryByChainId,
  getOracleByChainId,
  getUSDCByChainId,
} from "@/utils/contracts";
import { useAppKitAccount, useAppKitNetwork } from "@reown/appkit/react";
import { Address, pad, parseUnits, toBytes, toHex } from "viem";
import { useExecuteFunctionWithTokenTransfer } from "./useExecuteFunctionWithTokenTransfer";
import { defaultChain } from "@/utils/appkit/context";

type useSubmitProposalProps = {
  request: Address;
  answer: any;
};

export const useSubmitProposal = ({
  request,
  answer,
}: useSubmitProposalProps) => {
  const { address: account } = useAppKitAccount();
  const address = getOracleByChainId(defaultChain.id)!;
  const chainId = defaultChain.id;
  return useExecuteFunctionWithTokenTransfer({
    address,
    abi: abi as any,
    account: account as Address,
    functionName: "proposeAnswer",
    args: [request, answer],
    chainId,
    eventNames: ["AnswerProposed"],
    transferToken: getUSDCByChainId(defaultChain.id),
    transferAmount: BigInt(parseUnits("100", 6)),
    enabled: Boolean(request && answer),
  });
};
