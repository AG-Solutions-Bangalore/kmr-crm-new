import { api, throwIfApiError, toFormData } from "@/lib/axios.ts";
import type {
  FaqCreatePayload,
  FaqItem,
  FaqListResponse,
  FaqStatus,
  FaqUpdatePayload,
  PageTwoItem,
} from "../types/faq.types.ts";

/** GET /pageTwo — Fetch page options for FAQ placement. */
export async function fetchPageTwo(): Promise<PageTwoItem[]> {
  const { data } = await api.get<{ data?: PageTwoItem[] } | PageTwoItem[]>("/pageTwo");
  if (Array.isArray(data)) return data;
  if (data && typeof data === "object" && "data" in data && Array.isArray(data.data)) {
    return data.data;
  }
  return [];
}

/** GET /faq — Fetch all FAQs. */
export async function fetchFaqs(): Promise<FaqItem[]> {
  const { data } = await api.get<FaqListResponse | FaqItem[]>("/faq");
  if (Array.isArray(data)) return data;
  if (data && typeof data === "object") {
    if (Array.isArray(data.data)) return data.data;
    if (data.data && typeof data.data === "object" && Array.isArray(data.data.data)) {
      return data.data.data;
    }
  }
  return [];
}

/** GET /faq/:id — Fetch single FAQ details with question subs. */
export async function fetchFaqById(id: number | string): Promise<FaqItem> {
  const { data } = await api.get<{ data?: FaqItem } | FaqItem>(`/faq/${id}`);
  if (data && typeof data === "object" && "data" in data && data.data) {
    return data.data;
  }
  return data as FaqItem;
}

/** POST /faq — Create new FAQ group with questions. */
export async function createFaq(payload: FaqCreatePayload): Promise<unknown> {
  const { data } = await api.post("/faq", payload);
  throwIfApiError(data as { code?: number; message?: string }, "Could not create FAQ.");
  return data;
}

/** PUT /faq/:id — Update existing FAQ group. */
export async function updateFaq(
  id: number | string,
  payload: FaqUpdatePayload,
): Promise<unknown> {
  const { data } = await api.put(`/faq/${id}`, payload);
  throwIfApiError(data as { code?: number; message?: string }, "Could not update FAQ.");
  return data;
}

/** PATCH /faqs/:id/status — Toggle FAQ status. */
export async function updateFaqStatus(
  id: number | string,
  status: FaqStatus,
): Promise<unknown> {
  const formData = toFormData({
    _method: "PATCH",
    faq_status: status,
  });

  const { data } = await api.post(`/faqs/${id}/status`, formData);
  throwIfApiError(data as { code?: number; message?: string }, "Could not update FAQ status.");
  return data;
}

/** DELETE /faq-sub/:id — Delete a specific FAQ question. */
export async function deleteFaqSub(id: number | string): Promise<unknown> {
  const { data } = await api.delete(`/faq-sub/${id}`);
  throwIfApiError(data as { code?: number; message?: string }, "Could not delete FAQ question.");
  return data;
}

/** DELETE /faq/:id — Delete an entire FAQ section. */
export async function deleteFaq(id: number | string): Promise<unknown> {
  const { data } = await api.delete(`/faq/${id}`);
  throwIfApiError(data as { code?: number; message?: string }, "Could not delete FAQ.");
  return data;
}
