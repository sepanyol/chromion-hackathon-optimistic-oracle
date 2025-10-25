import { Abi, Address } from "viem";
import { useExecuteFunction } from "./useExecuteFunction";
import abi from "@/abis/coordinator.json";
import { getOracleByChainId } from "@/utils/contracts";
import { defaultChain } from "@/utils/appkit/context";

type UseClaimRewardProps = {
  request: Address;
  enabled: boolean;
};
export const useClaimReward = ({ request, enabled }: UseClaimRewardProps) =>
  useExecuteFunction({
    abi: abi as Abi,
    address: getOracleByChainId(defaultChain.id)!,
    args: [request],
    chainId: defaultChain.id,
    eventNames: ["RewardDistributed"],
    functionName: "claimReward",
    enabled,
  });
