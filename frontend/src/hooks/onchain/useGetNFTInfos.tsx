import { Abi, Address, isAddress } from "viem";
import { useAccount, useReadContracts } from "wagmi";
import abi from "./../../abis/erc721.json";

type useGetNFTInfosProps = {
  address: Address;
};
export const useGetNFTInfos = ({ address }: useGetNFTInfosProps) => {
  const { chainId } = useAccount();
  return useReadContracts({
    contracts: [
      {
        abi: abi as Abi,
        address: address,
        chainId,
        functionName: "name",
      },
      {
        abi: abi as Abi,
        address: address,
        chainId,
        functionName: "symbol",
      },
    ],
    query: {
      enabled: isAddress(address),
      select: ([name, symbol]) => ({
        name: name.status == "success" ? name.result : null,
        symbol: symbol.status == "success" ? symbol.result : null,
      }),
    },
  });
};
