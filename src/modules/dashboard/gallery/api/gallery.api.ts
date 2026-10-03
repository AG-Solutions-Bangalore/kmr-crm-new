import { api, throwIfApiError, toFormData } from "@/lib/axios.ts";
import { pageQuery, parsePaginatedResponse, type PagedResult } from "@/lib/pagination.ts";
import type {
  GalleryItem,
  GalleryListResponse,
  GalleryMutationPayload,
  GalleryStatus,
} from "../types/gallery.types.ts";

/** GET /gallery — Fetch all gallery images. */
export async function fetchGallery(): Promise<GalleryItem[]> {
  const { data } = await api.get<GalleryListResponse | GalleryItem[]>("/gallery");
  if (Array.isArray(data)) return data;
  if (data && typeof data === "object") {
    if (Array.isArray(data.data)) return data.data;
    if (data.data && typeof data.data === "object" && Array.isArray(data.data.data)) {
      return data.data.data;
    }
  }
  return [];
}

/** GET /gallery?page=N&per_page=M&search=Q — Server-side paginated gallery images. */
export async function fetchGalleryPage(
  page = 1,
  perPage = 10,
  search = "",
): Promise<PagedResult<GalleryItem>> {
  const { data } = await api.get<GalleryListResponse | GalleryItem[]>(
    pageQuery("/gallery", page, perPage, search),
  );
  return parsePaginatedResponse<GalleryItem>(data, page, perPage);
}

/** GET /gallery/:id — Fetch single gallery item. */
export async function fetchGalleryById(id: number | string): Promise<GalleryItem> {
  const { data } = await api.get<{ data?: GalleryItem } | GalleryItem>(`/gallery/${id}`);
  if (data && typeof data === "object" && "data" in data && data.data) {
    return data.data;
  }
  return data as GalleryItem;
}

/** POST /gallery — Create new gallery image. */
export async function createGallery(payload: GalleryMutationPayload): Promise<unknown> {
  const formData = toFormData({
    gallery_image: payload.gallery_image ?? "",
    gallery_status: payload.gallery_status ?? "Active",
  });

  const { data } = await api.post("/gallery", formData);
  throwIfApiError(data as { code?: number; message?: string }, "Could not upload gallery image.");
  return data;
}

/** PUT /gallery/:id — Update gallery item. */
export async function updateGallery(
  id: number | string,
  payload: GalleryMutationPayload,
): Promise<unknown> {
  const formData = toFormData({
    _method: "PUT",
    gallery_image: payload.gallery_image ?? "",
    gallery_status: payload.gallery_status ?? "Active",
  });

  const { data } = await api.post(`/gallery/${id}`, formData);
  throwIfApiError(data as { code?: number; message?: string }, "Could not update gallery item.");
  return data;
}

/** PATCH /gallerys/:id/status — Toggle gallery status. */
export async function updateGalleryStatus(
  id: number | string,
  status: GalleryStatus,
): Promise<unknown> {
  const formData = toFormData({
    _method: "PATCH",
    gallery_status: status,
  });

  const { data } = await api.post(`/gallerys/${id}/status`, formData);
  throwIfApiError(data as { code?: number; message?: string }, "Could not update gallery status.");
  return data;
}
