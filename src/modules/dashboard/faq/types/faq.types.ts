export type FaqStatus = "Active" | "Inactive";

export interface PageTwoItem {
  page_two_url: string;
  page_two_name: string;
}

export interface FaqSubItem {
  id?: number | string;
  faq_id?: number | string;
  faq_sort?: number | string;
  faq_heading?: string;
  faq_que: string;
  faq_ans: string;
  faq_status?: FaqStatus | string;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface FaqItem {
  id: number;
  faq_for: string;
  faq_status?: FaqStatus | string;
  subs?: FaqSubItem[];
  created_at?: string | null;
  updated_at?: string | null;
}

export interface FaqListResponse {
  code?: number;
  message?: string;
  data?: FaqItem[] | {
    current_page?: number;
    data: FaqItem[];
    total?: number;
    per_page?: number;
    last_page?: number;
  };
}

export interface FaqCreatePayload {
  faq_for: string;
  subs: Array<{
    faq_sort?: string | number;
    faq_heading?: string;
    faq_que: string;
    faq_ans: string;
  }>;
}

export interface FaqUpdatePayload {
  faq_for: string;
  faq_status?: FaqStatus | string;
  subs: Array<{
    id?: number | string;
    faq_sort?: string | number;
    faq_heading?: string;
    faq_que: string;
    faq_ans: string;
    faq_status?: FaqStatus | string;
  }>;
}
