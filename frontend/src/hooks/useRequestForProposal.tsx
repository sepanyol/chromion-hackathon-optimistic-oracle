// import { fetchUserProposer } from "@/utils/api/fetchUserProposer";
import { fetchRequestForProposal } from "@/utils/api/fetchRequest";
import { useQuery } from "@tanstack/react-query";
import { Address } from "viem";

export const useRequestForProposal = (address: Address) =>
  useQuery({
    queryKey: ["request", "for-proposal", address],
    queryFn: async () => await fetchRequestForProposal(address),
    enabled: Boolean(address),
    select: (result) =>
      result.data && result.data.request ? result.data.request : null,
  });
