import { fetchUserRequester } from "@/utils/api/fetchUserRequester";
import { useQuery } from "@tanstack/react-query";
import { Address } from "viem";

export const useUserRequester = (address: Address) =>
  useQuery({
    queryKey: ["requester", "stats", address],
    queryFn: async () => await fetchUserRequester(address),
    enabled: Boolean(address),
    select: (result: any) =>
      result.data && result.data.userRequester
        ? result.data.userRequester
        : null,
  });
