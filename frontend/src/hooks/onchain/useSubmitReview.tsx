import abi from "@/abis/coordinator.json";
import { defaultChain } from "@/utils/appkit/context";
import { getOracleByChainId, getUSDCByChainId } from "@/utils/contracts";
import { useAppKitAccount } from "@reown/appkit/react";
import { isBoolean } from "lodash";
import { Address, parseUnits } from "viem";
import { useExecuteFunctionWithTokenTransfer } from "./useExecuteFunctionWithTokenTransfer";

type useSubmitReviewProps = {
  request: Address;
  reason: string;
  supportChallenge: boolean | null;
};

export const useSubmitReview = ({
  request,
  reason,
  supportChallenge,
}: useSubmitReviewProps) => {
  const { address: account } = useAppKitAccount();
  const address = getOracleByChainId(defaultChain.id)!;
  const chainId = defaultChain.id;
  return useExecuteFunctionWithTokenTransfer({
    address,
    abi: abi as any,
    account: account as Address,
    functionName: "submitReview",
    args: [request, reason, supportChallenge],
    chainId,
    eventNames: ["ReviewSubmitted"],
    transferToken: getUSDCByChainId(defaultChain.id),
    transferAmount: BigInt(parseUnits("5", 6)), // TODO get from Oracle
    enabled: Boolean(request && reason && isBoolean(supportChallenge)),
  });
};
