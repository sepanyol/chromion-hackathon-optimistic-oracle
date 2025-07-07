import nftAbi from "@/abis/wrapper.json";
import { defaultChain } from "@/utils/appkit/context";
import { getNFTWrapperByChainId } from "@/utils/contracts";
import { isUndefined } from "lodash";
import { Address, erc20Abi, formatUnits } from "viem";
import { useReadContract, useReadContracts } from "wagmi";

type PriceTagProps = {
  id: bigint;
  priceFromList?: bigint;
  assetFromList?: Address;
};
export const PriceTag = ({
  id,
  priceFromList,
  assetFromList,
}: PriceTagProps) => {
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

  const { data: assetFromContract } = useReadContract({
    abi: nftAbi,
    address: getNFTWrapperByChainId(defaultChain.id),
    functionName: "usdc",
    query: {
      enabled: !assetFromList,
      select: (res: any) => res as Address,
      retry: false,
    },
  });

  const asset = assetFromContract || assetFromList;
  const { data: tokenInfo } = useReadContracts({
    allowFailure: false,
    contracts: [
      {
        address: asset,
        abi: erc20Abi,
        functionName: "decimals",
      },

      {
        address: asset,
        abi: erc20Abi,
        functionName: "symbol",
      },
    ],
    query: {
      select: ([decimals, symbol]) => ({ decimals, symbol }),
    },
  });

  if (tokenInfo && (priceFromContract || priceFromList))
    return (
      <span>
        {formatUnits(priceFromContract || priceFromList!, tokenInfo.decimals)}{" "}
        {tokenInfo.symbol}
      </span>
    );

  return <span>n/a</span>;
};
