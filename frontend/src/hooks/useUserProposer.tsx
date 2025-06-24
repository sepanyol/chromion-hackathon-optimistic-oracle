import { fetchUserProposer } from "@/utils/api/fetchUserProposer";
import { useQuery } from "@tanstack/react-query";
import { Address } from "viem";

export const useUserProposer = (address: Address) =>
  useQuery({
    queryKey: ["proposer", "stats", address],
    queryFn: async () => await fetchUserProposer(address),
    enabled: Boolean(address),
    select: (result) =>
      result.data
        ? {
            user: result.data.userProposer,
            requests: result.data.requests,
            dashboard: result.data.dashboard,
          }
        : null,
  });
