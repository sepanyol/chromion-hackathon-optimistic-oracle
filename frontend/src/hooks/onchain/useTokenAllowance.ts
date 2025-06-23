import { Address, erc20Abi as abi } from "viem";
import { useReadContract } from "wagmi";

export type useTokenAllowanceProps = {
  address: Address; // token address
  owner: Address;
  spender: Address;
  chainId: number;
  refetch?: boolean;
  refetchIntervalInMS?: number;
};
export const useTokenAllowance = ({
  address, // token address
  owner,
  spender,
  chainId,
  refetch = false,
  refetchIntervalInMS = 2000,
}: useTokenAllowanceProps) =>
  useReadContract({
    address,
    chainId,
    abi,
    functionName: "allowance",
    args: [owner, spender],
    query: {
      select: (data: bigint) => data,
      refetchInterval: refetch ? refetchIntervalInMS : false,
      enabled: Boolean(address && owner && spender && chainId),
    },
  });
