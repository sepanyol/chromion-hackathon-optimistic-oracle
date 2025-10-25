import { defaultChain } from "@/utils/appkit/context";
import { getOracleByChainId } from "@/utils/contracts";
import { Abi, Address, isHex } from "viem";
import { useReadContract } from "wagmi";
import abi from "../../abis/coordinator.json";

type UseGetReviewReturnType = {
  reviewer: Address;
  timestamp: bigint;
  reason: string;
  supportsChallenge: boolean;
};

type UseGetProposalProps = {
  requestId: Address | null;
  reviewer: Address | null;
};

export const useGetReview = ({ requestId, reviewer }: UseGetProposalProps) => {
  return useReadContract({
    address: getOracleByChainId(defaultChain.id)!,
    chainId: defaultChain.id,
    abi: abi as Abi,
    functionName: "getReviewerVotes",
    args: [requestId, reviewer],
    query: {
      enabled: isHex(requestId) && isHex(reviewer),
      select: (data) => data as UseGetReviewReturnType,
    },
  });
};
