import { FullRequestChallengeType } from "@/types/Requests";
import { fetchUserChallenger } from "@/utils/api/fetchUserChallenger";
import { useQuery } from "@tanstack/react-query";
import { Address } from "viem";

export const useUserChallenger = (address: Address) =>
  useQuery({
    queryKey: ["challenger", "stats", address],
    queryFn: async () => await fetchUserChallenger(address),
    enabled: Boolean(address),
    select: (result: any) =>
      result.data
        ? {
            user: result.data.userChallenger,
            requests: result.data.requests as FullRequestChallengeType[],
            dashboard: result.data.dashboard,
          }
        : null,
  });
