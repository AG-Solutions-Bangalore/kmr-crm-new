export type EnquiryStatus = "Pending" | "Cancel" | "Complete";

export interface EnquiryItem {
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
  enquiryStatus?: EnquiryStatus | string;
  // legacy mock aliases (kept for backward compat)
  name?: string | null;
  email?: string | null;
  mobile?: string | null;
  subject?: string | null;
  message?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface EnquiryListResponse {
  code?: number;
  message?: string;
  data?: EnquiryItem[] | {
    current_page?: number;
    data: EnquiryItem[];
    total?: number;
    per_page?: number;
    last_page?: number;
  };
}

export interface EnquiryUpdatePayload {
  enquiryStatus: EnquiryStatus;
}
