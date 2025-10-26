import { FullRequestReviewType } from "@/types/Requests";
import { fetchUserReviewer } from "@/utils/api/fetchUserReviewer";
import { useQuery } from "@tanstack/react-query";
import { Address } from "viem";

export const useUserReviewer = (address: Address) =>
  useQuery({
    queryKey: ["reviewer", "stats", address],
    queryFn: async () => await fetchUserReviewer(address),
    enabled: Boolean(address),
    select: (result: any) =>
      result.data
        ? {
            user: result.data.userReviewer,
            requests: result.data.requests as FullRequestReviewType[],
            dashboard: result.data.dashboard,
          }
        : null,
  });
