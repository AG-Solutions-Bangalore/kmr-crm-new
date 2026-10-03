import { api, throwIfApiError } from "@/lib/axios.ts";
import type {
  NewsletterListResponse,
  NewsletterSubscriber,
} from "../types/newsletter.types.ts";

/** GET /newsletter — Fetch all newsletter subscribers. */
export async function fetchNewsletterSubscribers(): Promise<NewsletterSubscriber[]> {
  const { data } = await api.get<NewsletterListResponse | NewsletterSubscriber[]>("/newsletter");
  if (Array.isArray(data)) return data;
  if (data && typeof data === "object") {
    if (Array.isArray(data.data)) return data.data;
    if (data.data && typeof data.data === "object" && Array.isArray(data.data.data)) {
      return data.data.data;
    }
  }
  return [];
}

/** DELETE /newsletter/:id — Remove a newsletter subscriber. */
export async function deleteNewsletterSubscriber(id: number | string): Promise<unknown> {
  const { data } = await api.delete(`/newsletter/${id}`);
  throwIfApiError(data as { code?: number; message?: string }, "Could not remove subscriber.");
  return data;
}
