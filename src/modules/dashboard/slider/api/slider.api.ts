import { api, throwIfApiError, toFormData } from "@/lib/axios.ts";
import type {
  SliderItem,
  SliderListResponse,
  SliderMutationPayload,
  SliderStatus,
} from "../types/slider.types.ts";

/** GET /slider — Fetch all sliders. */
export async function fetchSliders(): Promise<SliderItem[]> {
  const { data } = await api.get<SliderListResponse | SliderItem[]>("/slider");
  if (Array.isArray(data)) return data;
  if (data && typeof data === "object") {
    if (Array.isArray(data.data)) return data.data;
    if (data.data && typeof data.data === "object" && Array.isArray(data.data.data)) {
      return data.data.data;
    }
  }
  return [];
}

/** GET /slider/:id — Fetch single slider details. */
export async function fetchSliderById(id: number | string): Promise<SliderItem> {
  const { data } = await api.get<{ data?: SliderItem } | SliderItem>(`/slider/${id}`);
  if (data && typeof data === "object" && "data" in data && data.data) {
    return data.data;
  }
  return data as SliderItem;
}

/** POST /slider — Create new slider banner. */
export async function createSlider(payload: SliderMutationPayload): Promise<unknown> {
  const formData = toFormData({
    slider_type: payload.slider_type,
    // Omit for Home — sending "0"/"1" trips "Selected category does not exist."
    ...(payload.category_id &&
    String(payload.category_id) !== "0" &&
    String(payload.category_id) !== ""
      ? { category_id: payload.category_id }
      : {}),
    slider_image: payload.slider_image ?? "",
    slider_url: payload.slider_url ?? "",
    slider_sort_order: payload.slider_sort_order ?? "1",
    slider_status: payload.slider_status ?? "Active",
  });

  const { data } = await api.post("/slider", formData);
  throwIfApiError(data as { code?: number; message?: string }, "Could not create slider.");
  return data;
}

/** PUT /slider/:id — Update existing slider. */
export async function updateSlider(
  id: number | string,
  payload: SliderMutationPayload,
): Promise<unknown> {
  // Omit image when unchanged — sending "" trips backend required validation.
  // Omit category for Home — sending "0"/"1" trips "Selected category does not exist."
  const formData = toFormData({
    _method: "PUT",
    slider_type: payload.slider_type,
    ...(payload.category_id &&
    String(payload.category_id) !== "0" &&
    String(payload.category_id) !== ""
      ? { category_id: payload.category_id }
      : {}),
    ...(payload.slider_image instanceof File
      ? { slider_image: payload.slider_image }
      : {}),
    slider_url: payload.slider_url ?? "",
    slider_sort_order: payload.slider_sort_order ?? "1",
    slider_status: payload.slider_status ?? "Active",
  });

  const { data } = await api.post(`/slider/${id}`, formData);
  throwIfApiError(data as { code?: number; message?: string }, "Could not update slider.");
  return data;
}

/** PATCH /sliders/:id/status — Toggle slider status. */
export async function updateSliderStatus(
  id: number | string,
  status: SliderStatus,
): Promise<unknown> {
  const formData = toFormData({
    _method: "PATCH",
    slider_status: status,
  });

  const { data } = await api.post(`/sliders/${id}/status`, formData);
  throwIfApiError(data as { code?: number; message?: string }, "Could not update slider status.");
  return data;
}
