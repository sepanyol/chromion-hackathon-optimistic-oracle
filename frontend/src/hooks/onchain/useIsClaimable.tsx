import abi from "@/abis/coordinator.json";
import { defaultChain } from "@/utils/appkit/context";
import { getOracleByChainId } from "@/utils/contracts";
import { Address } from "viem";
import { useReadContract } from "wagmi";

type UseIsClaimableProps = { request: Address; account: Address };
export const useIsClaimable = ({ request, account }: UseIsClaimableProps) =>
  useReadContract({
    address: getOracleByChainId(defaultChain.id),
    abi,
    functionName: "isClaimable",
    args: [request, account],
    query: { retry: false, select: (res: any) => res as boolean },
  });
