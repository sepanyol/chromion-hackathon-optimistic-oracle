import { fetchAvailableReviews } from "@/utils/api/fetchAvailableReviews";
import { useQuery } from "@tanstack/react-query";

export const useAvailableReviews = () =>
  useQuery({
    queryKey: ["available-reviews"],
    queryFn: async () => await fetchAvailableReviews(),
    select: (result) =>
      result && result.data && result.data.proposalChallenges
        ? result.data.proposalChallenges
        : null,
  });
