import { api, throwIfApiError, toFormData } from "@/lib/axios.ts";
import type {
  NewsItem,
  NewsListResponse,
  NewsMutationPayload,
  NewsStatus,
} from "../types/news.types.ts";

/** GET /news — Fetch all news items. */
export async function fetchNews(): Promise<NewsItem[]> {
  const { data } = await api.get<NewsListResponse | NewsItem[]>("/news");
  if (Array.isArray(data)) return data;
  if (data && typeof data === "object") {
    if (Array.isArray(data.data)) return data.data;
    if (data.data && typeof data.data === "object" && Array.isArray(data.data.data)) {
      return data.data.data;
    }
  }
  return [];
}

/** GET /news/:id — Fetch single news item. */
export async function fetchNewsById(id: number | string): Promise<NewsItem> {
  const { data } = await api.get<{ data?: NewsItem } | NewsItem>(`/news/${id}`);
  if (data && typeof data === "object" && "data" in data && data.data) {
    return data.data;
  }
  return data as NewsItem;
}

/** POST /news — Create new news item. */
export async function createNews(payload: NewsMutationPayload): Promise<unknown> {
  const formData = toFormData({
    category_id: payload.category_id,
    news_heading: payload.news_heading,
    news_details: payload.news_details,
    news_image: payload.news_image ?? "",
    news_other_image: payload.news_other_image ?? "",
    news_status: payload.news_status ?? "Active",
  });

  const { data } = await api.post("/news", formData);
  throwIfApiError(data as { code?: number; message?: string }, "Could not create news article.");
  return data;
}

/** PUT /news/:id — Update existing news item. */
export async function updateNews(
  id: number | string,
  payload: NewsMutationPayload,
): Promise<unknown> {
  const formData = toFormData({
    _method: "PUT",
    category_id: payload.category_id,
    news_heading: payload.news_heading,
    news_details: payload.news_details,
    news_image: payload.news_image ?? "",
    news_other_image: payload.news_other_image ?? "",
    news_status: payload.news_status ?? "Active",
  });

  const { data } = await api.post(`/news/${id}`, formData);
  throwIfApiError(data as { code?: number; message?: string }, "Could not update news article.");
  return data;
}

/** PATCH /newss/:id/status — Toggle news article status. */
export async function updateNewsStatus(
  id: number | string,
  status: NewsStatus,
): Promise<unknown> {
  const formData = toFormData({
    _method: "PATCH",
    news_status: status,
  });

  const { data } = await api.post(`/newss/${id}/status`, formData);
  throwIfApiError(data as { code?: number; message?: string }, "Could not update news status.");
  return data;
}
