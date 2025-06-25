import { defaultChain } from "@/utils/appkit/context";
import { getOracleByChainId } from "@/utils/contracts";
import { Abi, Address, isHex } from "viem";
import { useReadContract } from "wagmi";
import abi from "../../abis/coordinator.json";

type UseGetProposalReturnType = {
  proposer: Address;
  timestamp: bigint;
  answer: Address;
};

type UseGetProposalProps = {
  requestId: Address;
};

export const useGetProposal = ({ requestId }: UseGetProposalProps) => {
  return useReadContract({
    address: getOracleByChainId(defaultChain.id)!,
    chainId: defaultChain.id,
    abi: abi as Abi,
    functionName: "getProposal",
    args: [requestId],
    query: {
      enabled: isHex(requestId),
      select: (data) => data as UseGetProposalReturnType,
    },
  });
};
