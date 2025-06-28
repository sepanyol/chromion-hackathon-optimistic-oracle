import { Abi, Address, isAddress } from "viem";
import { useAccount, useReadContract } from "wagmi";
import abi from "./../../abis/erc721.json";

type useGetNFTOwnerOfProps = {
  address: Address;
  tokenId: bigint | undefined;
};
export const useGetNFTOwnerOf = ({
  address,
  tokenId,
}: useGetNFTOwnerOfProps) => {
  const { chainId } = useAccount();
  return useReadContract({
    abi: abi as Abi,
    address: address,
    chainId,
    functionName: "ownerOf",
    args: [tokenId],
    query: {
      retry: false,
      enabled: isAddress(address) && Boolean(tokenId && tokenId >= BigInt(0)),
      // select: ([name, symbol]) => ({
      //   name: name.status == "success" ? name.result : null,
      //   symbol: symbol.status == "success" ? symbol.result : null,
      // }),
    },
  });
};
