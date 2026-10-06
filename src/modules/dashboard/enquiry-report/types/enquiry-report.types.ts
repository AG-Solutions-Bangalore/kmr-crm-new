export type EnquiryReportStatus = "Pending" | "Cancel" | "Complete";

export interface EnquiryReportItem {
  id: number;
  enquiryFullName?: string | null;
  enquiryMobile?: string | null;
  enquiryEmail?: string | null;
  enquiryService?: string | null;
  enquiryFrom?: string | null;
  enquiryMessage?: string | null;
  utm_medium?: string | null;
  utm_source?: string | null;
  utm_campaign?: string | null;
  enquiryStatus?: EnquiryReportStatus | string;
}

export interface EnquiryReportListResponse {
  code?: number;
  message?: string;
  data?: EnquiryReportItem[];
}
