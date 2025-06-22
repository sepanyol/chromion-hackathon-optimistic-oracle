import { fetchRequests } from "@/utils/api/fetchRequests";
import { RequestStatus } from "@/utils/helpers";
import { useQuery } from "@tanstack/react-query";

export const useActiveRequests = (status?: RequestStatus) =>
  useQuery({
    queryKey: ["active-requests", "status", status],
    queryFn: async () => await fetchRequests(status),
    select: (result) =>
      result.data && result.data.requests && result.data.requests.length
        ? result.data.requests
        : null,
  });
