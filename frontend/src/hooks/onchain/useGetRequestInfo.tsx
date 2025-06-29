import nftAbi from "@/abis/wrapper.json";
import { getNFTWrapperByChainId } from "@/utils/contracts";
import { defaultChain } from "@/utils/appkit/context";
import { useReadContract } from "wagmi";
import { Address } from "viem";

type UseGetRequestInfoProps = { id: bigint };
export const useGetRequestInfo = ({ id }: UseGetRequestInfoProps) =>
  useReadContract({
    abi: nftAbi,
    args: [id],
    address: getNFTWrapperByChainId(defaultChain.id),
    functionName: "getRequestInfo",
    query: {
      enabled: !!id,
      select: (res: any) => res as { isResolved: boolean; request: Address },
      retry: false,
    },
  });
