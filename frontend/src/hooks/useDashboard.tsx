import { fetchDashboard } from "@/utils/api/fetchDashboard";
import { useQuery } from "@tanstack/react-query";

export const useDashboard = () =>
  useQuery({
    queryKey: ["dashboard", "stats"],
    queryFn: async () => await fetchDashboard(),
    select: (result) =>
      result.data && result.data.dashboards.length > 0
        ? result.data.dashboards[0]
        : null,
  });
