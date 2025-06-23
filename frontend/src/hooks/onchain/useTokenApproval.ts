import { isUndefined } from "lodash";
import { Address, erc20Abi as abi } from "viem";
import { useExecuteFunction } from "./useExecuteFunction";

export type useTokenApprovalProps = {
  address: Address;
  spender: Address;
  amount: bigint;
  chainId: number;
};

export const useTokenApproval = ({
  address,
  spender,
  amount,
  chainId,
}: useTokenApprovalProps) =>
  useExecuteFunction({
    address,
    chainId,
    abi,
    functionName: "approve",
    args: [spender, amount],
    eventNames: [],
    enabled: Boolean(
      address &&
        spender &&
        chainId &&
        !isUndefined(amount) &&
        amount > BigInt(0)
    ),
  });
