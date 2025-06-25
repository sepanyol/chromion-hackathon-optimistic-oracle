import abi from "@/abis/coordinator.json";
import { defaultChain } from "@/utils/appkit/context";
import { getOracleByChainId, getUSDCByChainId } from "@/utils/contracts";
import { useAppKitAccount } from "@reown/appkit/react";
import { Address, parseUnits } from "viem";
import { useExecuteFunctionWithTokenTransfer } from "./useExecuteFunctionWithTokenTransfer";

type useSubmitChallengeProps = {
  request: Address;
  answer: any; // Bytes
  reason: any; // Bytes
};

export const useSubmitChallenge = ({
  request,
  answer,
  reason,
}: useSubmitChallengeProps) => {
  const { address: account } = useAppKitAccount();
  const address = getOracleByChainId(defaultChain.id)!;
  const chainId = defaultChain.id;
  return useExecuteFunctionWithTokenTransfer({
    address,
    abi: abi as any,
    account: account as Address,
    functionName: "challengeAnswer",
    args: [request, true, answer, reason],
    chainId,
    eventNames: ["ChallengeSubmitted"],
    transferToken: getUSDCByChainId(defaultChain.id),
    transferAmount: BigInt(parseUnits("100", 6)),
    enabled: Boolean(request && answer && reason),
  });
};
