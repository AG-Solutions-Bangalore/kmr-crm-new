import { api } from "@/lib/axios.ts";
import type {
  EnquiryReportItem,
  EnquiryReportListResponse,
} from "../types/enquiry-report.types.ts";

/** GET /getEnquiryReport — Full enquiry report (plain array, no pagination). */
export async function fetchEnquiryReport(): Promise<EnquiryReportItem[]> {
  const { data } = await api.get<EnquiryReportListResponse | EnquiryReportItem[]>(
    "/getEnquiryReport",
  );
  if (Array.isArray(data)) return data;
  if (data && typeof data === "object" && Array.isArray(data.data)) {
    return data.data;
  }
  return [];
}
