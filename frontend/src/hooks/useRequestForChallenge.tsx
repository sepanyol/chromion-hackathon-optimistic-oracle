// import { fetchUserProposer } from "@/utils/api/fetchUserProposer";
import { fetchRequestForChallenge } from "@/utils/api/fetchRequest";
import { useQuery } from "@tanstack/react-query";
import { Address } from "viem";

export const useRequestForChallenge = (address: Address) =>
  useQuery({
    queryKey: ["request", "for-challenge", address],
    queryFn: async () => await fetchRequestForChallenge(address),
    enabled: Boolean(address),
    select: (result) =>
      result.data && result.data.request ? result.data.request : null,
  });
