import abi from "@/abis/wrapper.json";
import { getNFTWrapperByChainId } from "@/utils/contracts";
import { isEmpty, isNumber } from "lodash";
import { Abi } from "viem";
import { useAccount } from "wagmi";
import { useExecuteFunction } from "./useExecuteFunction";

type UseEvaluateNFTProps = {
  nftId: number;
  context: string;
  enabled: boolean;
};
export const useEvaluateNFT = ({
  nftId,
  context,
  enabled,
}: UseEvaluateNFTProps) => {
  const { chainId } = useAccount();
  return useExecuteFunction({
    abi: abi as Abi,
    address: getNFTWrapperByChainId(chainId!),
    chainId: chainId!,
    args: [nftId, context],
    eventNames: ["EvaluatioNRequest"],
    functionName: "evaluate",
    enabled: enabled && isNumber(nftId) && !isEmpty(context),
  });
};
