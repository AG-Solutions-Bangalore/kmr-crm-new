import { api } from "@/lib/axios.ts";
import type { DashboardCounts, DashboardResponse } from "../types/dashboard.types.ts";

/** GET /dashboard — newsletter + enquiry counts. Bearer required. */
export async function fetchDashboardCounts(): Promise<DashboardCounts> {
  const { data } = await api.get<DashboardResponse>("/dashboard");
  const counts = data?.data ?? {};
  return {
    newsletter_count: Number(counts.newsletter_count) || 0,
    enquiry_count: Number(counts.enquiry_count) || 0,
  };
}
