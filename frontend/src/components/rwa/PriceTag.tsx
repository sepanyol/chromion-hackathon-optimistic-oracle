import nftAbi from "@/abis/wrapper.json";
import { useGetRequestInfo } from "@/hooks/onchain/useGetRequestInfo";
import { defaultChain } from "@/utils/appkit/context";
import { getNFTWrapperByChainId } from "@/utils/contracts";
import { formatUnits } from "viem";
import { useReadContract } from "wagmi";

type PriceTagProps = { id: bigint };
export const PriceTag = ({ id }: PriceTagProps) => {
  const getRequestInfo = useGetRequestInfo({ id });
  const getPrice = useReadContract({
    abi: nftAbi,
    args: [id],
    address: getNFTWrapperByChainId(defaultChain.id),
    functionName: "getPrice",
    query: {
      enabled: !!id,
      select: (res: any) => res as bigint,
      retry: false,
    },
  });

  if (!getRequestInfo.data || !getRequestInfo.data.isResolved) return <>n/a</>;

  return <span>${formatUnits(getPrice.data || BigInt(0), 6)}</span>;
};
