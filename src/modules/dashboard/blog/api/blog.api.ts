import { api, throwIfApiError, toFormData } from "@/lib/axios.ts";
import { syncApiNoImageUrl } from "@/lib/image.ts";
import { pageQuery, parsePaginatedResponse, type PagedResult } from "@/lib/pagination.ts";
import type {
  BlogItem,
  BlogListResponse,
  BlogMutationPayload,
  BlogStatus,
} from "../types/blog.types.ts";

/** GET /blog — Fetch all blog posts. */
export async function fetchBlogs(): Promise<BlogItem[]> {
  const { data } = await api.get<BlogListResponse | BlogItem[]>("/blog");
  syncApiNoImageUrl(data);
  if (Array.isArray(data)) return data;
  if (data && typeof data === "object") {
    if (Array.isArray(data.data)) return data.data;
    if (data.data && typeof data.data === "object" && Array.isArray(data.data.data)) {
      return data.data.data;
    }
  }
  return [];
}

/** GET /blog?page=N&per_page=M&search=Q&status=S — Server-side paginated blog posts. */
export async function fetchBlogsPage(
  page = 1,
  perPage = 10,
  search = "",
  status = "all",
): Promise<PagedResult<BlogItem>> {
  const { data } = await api.get<BlogListResponse | BlogItem[]>(
    pageQuery("/blog", page, perPage, search, status),
  );
  syncApiNoImageUrl(data);
  return parsePaginatedResponse<BlogItem>(data, page, perPage);
}

/** GET /blog/:id — Fetch single blog post. */
export async function fetchBlogById(id: number | string): Promise<BlogItem> {
  const { data } = await api.get<{ data?: BlogItem } | BlogItem>(`/blog/${id}`);
  if (data && typeof data === "object" && "data" in data && data.data) {
    return data.data;
  }
  return data as BlogItem;
}

/** POST /blog — Create new blog post. */
export async function createBlog(payload: BlogMutationPayload): Promise<unknown> {
  const formData = toFormData({
    blog_title: payload.blog_title,
    blog_slug: payload.blog_slug,
    blog_short_description: payload.blog_short_description,
    blog_description: payload.blog_description,
    blog_meta_keywords: payload.blog_meta_keywords ?? "",
    blog_banner_image: payload.blog_banner_image ?? "",
    blog_banner_image_alt: payload.blog_banner_image_alt ?? "",
    blog_categories_ids: payload.blog_categories_ids ?? "",
    blog_front: payload.blog_front ?? "1",
    blog_featured: payload.blog_featured ?? "0",
    blog_index: payload.blog_index ?? "Yes",
    blog_status: payload.blog_status ?? "Active",
  });

  const { data } = await api.post("/blog", formData);
  throwIfApiError(data as { code?: number; message?: string }, "Could not create blog post.");
  return data;
}

/** PUT /blog/:id — Update existing blog post. */
export async function updateBlog(
  id: number | string,
  payload: BlogMutationPayload,
): Promise<unknown> {
  const formData = toFormData({
    _method: "PUT",
    blog_title: payload.blog_title,
    blog_slug: payload.blog_slug,
    blog_short_description: payload.blog_short_description,
    blog_description: payload.blog_description,
    blog_meta_keywords: payload.blog_meta_keywords ?? "",
    blog_banner_image: payload.blog_banner_image ?? "",
    blog_banner_image_alt: payload.blog_banner_image_alt ?? "",
    blog_categories_ids: payload.blog_categories_ids ?? "",
    blog_front: payload.blog_front ?? "1",
    blog_featured: payload.blog_featured ?? "0",
    blog_index: payload.blog_index ?? "Yes",
    blog_status: payload.blog_status ?? "Active",
  });

  const { data } = await api.post(`/blog/${id}`, formData);
  throwIfApiError(data as { code?: number; message?: string }, "Could not update blog post.");
  return data;
}

/** PATCH /blogs/:id/status — Toggle blog post status. */
export async function updateBlogStatus(
  id: number | string,
  status: BlogStatus,
): Promise<unknown> {
  const formData = toFormData({
    _method: "PATCH",
    blog_status: status,
  });

  const { data } = await api.post(`/blogs/${id}/status`, formData);
  throwIfApiError(data as { code?: number; message?: string }, "Could not update blog status.");
  return data;
}
