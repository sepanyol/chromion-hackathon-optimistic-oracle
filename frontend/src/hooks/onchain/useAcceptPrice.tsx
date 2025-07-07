import abi from "@/abis/wrapper.json";
import { getNFTWrapperByChainId } from "@/utils/contracts";
import { useEvmClients } from "@s3panyol/use-evm-transaction-flow";
import { Abi } from "viem";
import { useExecuteFunction } from "./useExecuteFunction";

export const useAcceptPrice = (id: bigint, enabled: boolean = false) => {
  const { walletClient } = useEvmClients();
  const wrapperAddress = getNFTWrapperByChainId(walletClient?.chain.id!);
  return useExecuteFunction({
    abi: abi as Abi,
    address: wrapperAddress,
    functionName: "acceptProposedEvaluation",
    args: [BigInt(id)],
    chainId: walletClient?.chain.id!,
    eventNames: ["ProposedEvaluationAccepted"],
    enabled,
  });
};
