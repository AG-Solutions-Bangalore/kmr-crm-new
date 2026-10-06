import { api } from "@/lib/axios.ts";
import type {
  EnquiryReportItem,
  EnquiryReportListResponse,
} from "../types/enquiry-report.types.ts";

/** GET /getEnquiryReport — Full enquiry report (server-filtered when backend supports it). */
export async function fetchEnquiryReport(
  search = "",
  status = "all",
): Promise<EnquiryReportItem[]> {
  const q = search.trim();
  const s = status.trim();
  const lower = s.toLowerCase();
  const normStatus =
    lower === "active"
      ? "Active"
      : lower === "inactive"
        ? "Inactive"
        : lower === "all" || !s
          ? ""
          : s.charAt(0).toUpperCase() + s.slice(1);
  const statusPart = normStatus ? `&status=${encodeURIComponent(normStatus)}` : "";
  const query = q || statusPart ? `?${q ? `search=${encodeURIComponent(q)}` : ""}${q && statusPart ? "&" : ""}${statusPart.replace(/^&/, "")}` : "";
  const { data } = await api.get<EnquiryReportListResponse | EnquiryReportItem[]>(
    `/getEnquiryReport${query}`,
  );
  if (Array.isArray(data)) return data;
  if (data && typeof data === "object" && Array.isArray(data.data)) {
    return data.data;
  }
  return [];
}
