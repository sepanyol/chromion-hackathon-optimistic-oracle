import { isUndefined } from "lodash";
import { Address, erc721Abi as abi } from "viem";
import { useExecuteFunction } from "./useExecuteFunction";

export type useERC721ApprovalProps = {
  address: Address;
  spender: Address;
  id: bigint;
  chainId: number;
};

export const useERC721Approval = ({
  address,
  spender,
  id,
  chainId,
}: useERC721ApprovalProps) =>
  useExecuteFunction({
    address,
    chainId,
    abi,
    functionName: "approve",
    args: [spender, id],
    eventNames: [],
    enabled: Boolean(
      address && spender && chainId && !isUndefined(id) && id >= BigInt(0)
    ),
  });
