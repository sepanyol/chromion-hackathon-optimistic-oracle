import { fetchRecentActivity } from "@/utils/api/fetchRecentActivity";
import { useQuery } from "@tanstack/react-query";

export const useRecentActivity = () =>
  useQuery({
    queryKey: ["dashboard", "recent-activity"],
    queryFn: async () => await fetchRecentActivity(),
  });
