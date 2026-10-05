import { useQuery } from "@tanstack/react-query";
import { fetchEnquiryReport } from "../api/enquiry-report.api.ts";

export const enquiryReportKeys = {
  all: ["enquiry-report"] as const,
  list: () => [...enquiryReportKeys.all, "list"] as const,
};

/** Full enquiry report from GET /getEnquiryReport. */
export function useEnquiryReport() {
  return useQuery({
    queryKey: enquiryReportKeys.list(),
    queryFn: fetchEnquiryReport,
    retry: 1,
  });
}
