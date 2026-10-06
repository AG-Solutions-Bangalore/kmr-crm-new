import { useQuery } from "@tanstack/react-query";
import { fetchEnquiryReport } from "../api/enquiry-report.api.ts";

export const enquiryReportKeys = {
  all: ["enquiry-report"] as const,
  list: () => [...enquiryReportKeys.all, "list"] as const,
};

/** Full enquiry report from GET /getEnquiryReport (server-side search + status). */
export function useEnquiryReport(search = "", status = "all") {
  return useQuery({
    queryKey: [...enquiryReportKeys.all, "list", search, status] as const,
    queryFn: () => fetchEnquiryReport(search, status),
    retry: 1,
  });
}
