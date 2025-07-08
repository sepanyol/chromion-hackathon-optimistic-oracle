import nftAbi from "@/abis/wrapper.json";
import { defaultChain } from "@/utils/appkit/context";
import { getNFTWrapperByChainId } from "@/utils/contracts";
import { formatUnits } from "viem";
import { useReadContract } from "wagmi";
import { useOracleContext } from "../OracleProvider";

type PriceTagProps = {
  id: bigint;
  priceFromList?: bigint;
};
export const PriceTag = ({ id, priceFromList }: PriceTagProps) => {
  const { assetDecimals, assetSymbol } = useOracleContext();
  const { data: priceFromContract } = useReadContract({
    abi: nftAbi,
    args: [id],
    address: getNFTWrapperByChainId(defaultChain.id),
    functionName: "getPrice",
    query: {
      enabled: !!id && !priceFromList,
      select: (res: any) => res as bigint,
      retry: false,
    },
  });

  const price = priceFromContract || priceFromList;

  return price ? (
    <span>
      {formatUnits(price, assetDecimals!)} {assetSymbol}
    </span>
  ) : (
    <span>n/a</span>
  );
};
