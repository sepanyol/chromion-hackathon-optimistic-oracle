import { Abi, Address, isAddress } from "viem";
import { useAccount, useWriteContract } from "wagmi";
import { useExecuteFunction } from "./useExecuteFunction";
import { getNFTWrapperByChainId } from "@/utils/contracts";
import abi from "@/abis/wrapper.json";
import { isNumber } from "lodash";

type UseMintNFTProps = {
  originId: number;
  originNFT: Address;
  enabled: boolean;
};
export const useMintNFT = ({
  originId,
  originNFT,
  enabled,
}: UseMintNFTProps) => {
  const { chainId } = useAccount();
  return useExecuteFunction({
    abi: abi as Abi,
    address: getNFTWrapperByChainId(chainId!),
    chainId: chainId!,
    args: [originId, originNFT],
    eventNames: ["DepositedNft"],
    functionName: "deposit",
    enabled: enabled && isNumber(originId) && isAddress(originNFT),
  });
};
