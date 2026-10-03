import { api } from "@/lib/axios.ts";
import type { PageOneItem, PageTwoItem } from "../types/pages.types.ts";

/** GET /pageOne — Primary site page routes and display titles. */
export async function fetchPageOne(): Promise<PageOneItem[]> {
  const { data } = await api.get<{ data?: PageOneItem[] } | PageOneItem[]>("/pageOne");
  if (Array.isArray(data)) return data;
  if (data && typeof data === "object" && "data" in data && Array.isArray(data.data)) {
    return data.data;
  }
  return [];
}

/** GET /pageTwo — Secondary site page routes and titles for FAQs/Features. */
export async function fetchPageTwo(): Promise<PageTwoItem[]> {
  const { data } = await api.get<{ data?: PageTwoItem[] } | PageTwoItem[]>("/pageTwo");
  if (Array.isArray(data)) return data;
  if (data && typeof data === "object" && "data" in data && Array.isArray(data.data)) {
    return data.data;
  }
  return [];
}
