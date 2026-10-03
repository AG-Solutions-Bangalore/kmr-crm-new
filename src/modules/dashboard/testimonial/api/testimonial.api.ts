import { api, throwIfApiError, toFormData } from "@/lib/axios.ts";
import type {
  PageOneItem,
  TestimonialItem,
  TestimonialListResponse,
  TestimonialMutationPayload,
  TestimonialStatus,
} from "../types/testimonial.types.ts";

/** GET /pageOne — Fetch page options for testimonial placement. */
export async function fetchPageOne(): Promise<PageOneItem[]> {
  const { data } = await api.get<{ data?: PageOneItem[] } | PageOneItem[]>("/pageOne");
  if (Array.isArray(data)) return data;
  if (data && typeof data === "object" && "data" in data && Array.isArray(data.data)) {
    return data.data;
  }
  return [];
}

/** GET /testimonial — Fetch all testimonials. */
export async function fetchTestimonials(): Promise<TestimonialItem[]> {
  const { data } = await api.get<TestimonialListResponse | TestimonialItem[]>("/testimonial");
  if (Array.isArray(data)) return data;
  if (data && typeof data === "object") {
    if (Array.isArray(data.data)) return data.data;
    if (data.data && typeof data.data === "object" && Array.isArray(data.data.data)) {
      return data.data.data;
    }
  }
  return [];
}

/** GET /testimonial/:id — Fetch single testimonial details. */
export async function fetchTestimonialById(id: number | string): Promise<TestimonialItem> {
  const { data } = await api.get<{ data?: TestimonialItem } | TestimonialItem>(
    `/testimonial/${id}`,
  );
  if (data && typeof data === "object" && "data" in data && data.data) {
    return data.data;
  }
  return data as TestimonialItem;
}

/** POST /testimonial — Create new testimonial. */
export async function createTestimonial(
  payload: TestimonialMutationPayload,
): Promise<unknown> {
  const formData = toFormData({
    testimonial_for: payload.testimonial_for,
    testimonial_client_name: payload.testimonial_client_name,
    testimonial_description: payload.testimonial_description,
    testimonial_rating: String(payload.testimonial_rating ?? "5"),
    testimonial_status: payload.testimonial_status ?? "Active",
  });

  const { data } = await api.post("/testimonial", formData);
  throwIfApiError(data as { code?: number; message?: string }, "Could not create testimonial.");
  return data;
}

/** PUT /testimonial/:id — Update existing testimonial. */
export async function updateTestimonial(
  id: number | string,
  payload: TestimonialMutationPayload,
): Promise<unknown> {
  const formData = toFormData({
    _method: "PUT",
    testimonial_for: payload.testimonial_for,
    testimonial_client_name: payload.testimonial_client_name,
    testimonial_description: payload.testimonial_description,
    testimonial_rating: String(payload.testimonial_rating ?? "5"),
    testimonial_status: payload.testimonial_status ?? "Active",
  });

  const { data } = await api.post(`/testimonial/${id}`, formData);
  throwIfApiError(data as { code?: number; message?: string }, "Could not update testimonial.");
  return data;
}

/** PATCH /testimonials/:id/status — Toggle testimonial status. */
export async function updateTestimonialStatus(
  id: number | string,
  status: TestimonialStatus,
): Promise<unknown> {
  const formData = toFormData({
    _method: "PATCH",
    testimonial_status: status,
  });

  const { data } = await api.post(`/testimonials/${id}/status`, formData);
  throwIfApiError(data as { code?: number; message?: string }, "Could not update testimonial status.");
  return data;
}
