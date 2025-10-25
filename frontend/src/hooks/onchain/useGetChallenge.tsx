import { defaultChain } from "@/utils/appkit/context";
import { getOracleByChainId } from "@/utils/contracts";
import { Abi, Address, isHex } from "viem";
import { useReadContract } from "wagmi";
import abi from "../../abis/coordinator.json";

type UseGetChallengeReturnType = {
  challenger: Address;
  timestamp: bigint;
  answer: string;
  reason: string;
  votesFor: bigint;
  votesAgainst: bigint;
  reviews: {
    reviewer: Address;
    timestamp: bigint;
    reason: string;
    supportsChallenge: boolean;
  }[];
};

type UseGetProposalProps = {
  requestId: Address;
};

export const useGetChallenge = ({ requestId }: UseGetProposalProps) => {
  return useReadContract({
    address: getOracleByChainId(defaultChain.id)!,
    chainId: defaultChain.id,
    abi: abi as Abi,
    functionName: "getChallenge",
    args: [requestId],
    query: {
      enabled: isHex(requestId),
      select: (data) => data as UseGetChallengeReturnType,
    },
  });
};
