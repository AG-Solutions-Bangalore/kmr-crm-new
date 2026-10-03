export type EnquiryStatus = "Pending" | "Cancel" | "Complete";

export interface EnquiryItem {
  id: number;
  name?: string | null;
  email?: string | null;
  mobile?: string | null;
  subject?: string | null;
  message?: string | null;
  enquiryStatus?: EnquiryStatus | string;
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
