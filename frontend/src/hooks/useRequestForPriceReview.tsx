// import { fetchUserProposer } from "@/utils/api/fetchUserProposer";
import { fetchRequestForPriceReview } from "@/utils/api/fetchRequest";
import { useQuery } from "@tanstack/react-query";
import { Address } from "viem";

export const useRequestForPriceReview = (address: Address) =>
  useQuery({
    queryKey: ["request", "for-price-review", address],
    queryFn: async () => await fetchRequestForPriceReview(address),
    enabled: Boolean(address),
    select: (result) =>
      result.data && result.data.request ? result.data.request : null,
  });
