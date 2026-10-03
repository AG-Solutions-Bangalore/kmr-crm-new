import { api, throwIfApiError, toFormData } from "@/lib/axios.ts";
import type {
  EnquiryItem,
  EnquiryListResponse,
  EnquiryStatus,
} from "../types/enquiry.types.ts";

/** GET /enquiry — Fetch all customer enquiries. */
export async function fetchEnquiries(): Promise<EnquiryItem[]> {
  const { data } = await api.get<EnquiryListResponse | EnquiryItem[]>("/enquiry");
  if (Array.isArray(data)) return data;
  if (data && typeof data === "object") {
    if (Array.isArray(data.data)) return data.data;
    if (data.data && typeof data.data === "object" && Array.isArray(data.data.data)) {
      return data.data.data;
    }
  }
  return [];
}

/** GET /enquiry/:id — Fetch single enquiry details. */
export async function fetchEnquiryById(id: number | string): Promise<EnquiryItem> {
  const { data } = await api.get<{ data?: EnquiryItem } | EnquiryItem>(`/enquiry/${id}`);
  if (data && typeof data === "object" && "data" in data && data.data) {
    return data.data;
  }
  return data as EnquiryItem;
}

/** PUT /enquiry/:id — Update enquiry status. */
export async function updateEnquiryStatus(
  id: number | string,
  status: EnquiryStatus,
): Promise<unknown> {
  const formData = toFormData({
    _method: "PUT",
    enquiryStatus: status,
  });

  const { data } = await api.post(`/enquiry/${id}`, formData);
  throwIfApiError(data as { code?: number; message?: string }, "Could not update enquiry status.");
  return data;
}

/** DELETE /enquiry/:id — Delete an enquiry. */
export async function deleteEnquiry(id: number | string): Promise<unknown> {
  const { data } = await api.delete(`/enquiry/${id}`);
  throwIfApiError(data as { code?: number; message?: string }, "Could not delete enquiry.");
  return data;
}
