import { useQuery } from "@tanstack/react-query";
import { fetchDashboardCounts } from "../api/dashboard.api.ts";

export const dashboardKeys = {
  all: ["dashboard"] as const,
  counts: () => [...dashboardKeys.all, "counts"] as const,
};

/** Live newsletter + enquiry counts from GET /dashboard. */
export function useDashboardCounts() {
  return useQuery({
    queryKey: dashboardKeys.counts(),
    queryFn: fetchDashboardCounts,
    retry: 1,
    staleTime: 60 * 1000,
  });
}
