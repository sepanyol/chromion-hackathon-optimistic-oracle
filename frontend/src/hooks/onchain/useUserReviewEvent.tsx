import abi from "@/abis/coordinator.json";
import { defaultChain } from "@/utils/appkit/context";
import { getOracleByChainId } from "@/utils/contracts";
import { useQuery } from "@tanstack/react-query";
import { omit, pick } from "lodash";
import { Abi, AbiEvent, Address } from "viem";
import { useAccount, usePublicClient } from "wagmi";

// TODO remove this
export const useUserReviewEvent = (requestId: string) => {
  const { address: accountAddress } = useAccount();
  const client = usePublicClient();
  // TODO how to handle this here for mainnet?
  const oracleAddress = getOracleByChainId(defaultChain.id);

  return useQuery({
    queryKey: ["review-event", requestId, accountAddress],
    queryFn: async () => {
      if (!client) return Promise.resolve(() => null);

      const filter = await client.createEventFilter({
        address: oracleAddress,
        event: pick(
          abi.find((item) => item.name == "ReviewSubmitted"),
          ["name", "inputs"]
        ) as AbiEvent,
        args: {
          request: requestId as Address,
          reviewer: accountAddress as Address,
        },
      });

      const logs = await client.getFilterLogs({
        filter,
      });

      return logs;
    },
    enabled: Boolean(accountAddress),
  });
};
