// import { fetchUserProposer } from "@/utils/api/fetchUserProposer";
import { fetchRequestForReview } from "@/utils/api/fetchRequest";
import { useQuery } from "@tanstack/react-query";
import { Address } from "viem";

export const useRequestForReview = (address: Address) =>
  useQuery({
    queryKey: ["request", "for-review", address],
    queryFn: async () => await fetchRequestForReview(address),
    enabled: Boolean(address),
    select: (result) =>
      result.data && result.data.request ? result.data.request : null,
  });
