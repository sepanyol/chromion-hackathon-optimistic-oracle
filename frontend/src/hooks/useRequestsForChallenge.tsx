// import { fetchUserProposer } from "@/utils/api/fetchUserProposer";
import { fetchRequestsForChallenge } from "@/utils/api/fetchRequests";
import { useQuery } from "@tanstack/react-query";

export const useRequestsForChallenge = () =>
  useQuery({
    queryKey: ["requests", "for-challenge"],
    queryFn: async () => await fetchRequestsForChallenge(),
    select: (result) =>
      result.data && result.data.requests ? result.data.requests : [],
  });
