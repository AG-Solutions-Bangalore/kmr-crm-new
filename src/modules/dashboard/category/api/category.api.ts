import { api, throwIfApiError, toFormData } from "@/lib/axios.ts";
import { syncApiNoImageUrl } from "@/lib/image.ts";
import type {
  Category,
  CategoryDetailResponse,
  CategoryListResponse,
  CategoryMutationPayload,
  CategoryStatus,
} from "../types/category.types.ts";

function syncApiImageUrls(res: unknown): void {
  syncApiNoImageUrl(res);
}

/** GET /category — Fetch all categories (full list for dropdowns, server-filtered). */
export async function fetchCategories(search = "", status = "all"): Promise<Category[]> {
  // Backend paginates (10/page, 158 total) — ask for all for dropdowns.
  const q = search.trim();
  const s = status.trim().toLowerCase();
  const statusPart =
    s && s !== "all"
      ? `&status=${encodeURIComponent(s === "active" ? "Active" : s === "inactive" ? "Inactive" : status.trim())}`
      : "";
  const { data } = await api.get<CategoryListResponse | Category[]>(
    `/category?per_page=500${q ? `&search=${encodeURIComponent(q)}` : ""}${statusPart}`,
  );
  syncApiImageUrls(data);

  if (Array.isArray(data)) return data;
  if (data && typeof data === "object") {
    if (Array.isArray(data.data)) return data.data;
    if (data.data && typeof data.data === "object" && Array.isArray(data.data.data)) {
      return data.data.data;
    }
  }
  return [];
}

export interface CategoriesPage {
  items: Category[];
  total: number;
  perPage: number;
  currentPage: number;
  lastPage: number;
}

/** GET /category?page=N&per_page=M&search=Q&status=S — Server-side paginated categories for the list. */
export async function fetchCategoriesPage(
  page = 1,
  perPage = 10,
  search = "",
  status = "all",
): Promise<CategoriesPage> {
  const q = search.trim();
  const s = status.trim().toLowerCase();
  const statusPart =
    s && s !== "all"
      ? `&status=${encodeURIComponent(s === "active" ? "Active" : s === "inactive" ? "Inactive" : status.trim())}`
      : "";
  const { data } = await api.get<CategoryListResponse | Category[]>(
    `/category?page=${page}&per_page=${perPage}${q ? `&search=${encodeURIComponent(q)}` : ""}${statusPart}`,
  );
  syncApiImageUrls(data);

  if (Array.isArray(data)) {
    return {
      items: data,
      total: data.length,
      perPage: data.length || perPage,
      currentPage: 1,
      lastPage: 1,
    };
  }
  if (data && typeof data === "object") {
    const nested = data.data;
    if (nested && typeof nested === "object" && !Array.isArray(nested)) {
      const paged = nested as {
        current_page?: number;
        data: Category[];
        total?: number;
        per_page?: number;
        last_page?: number;
      };
      if (Array.isArray(paged.data)) {
        return {
          items: paged.data,
          total: paged.total ?? paged.data.length,
          perPage: paged.per_page ?? perPage,
          currentPage: paged.current_page ?? page,
          lastPage: paged.last_page ?? 1,
        };
      }
    }
    if (Array.isArray(nested)) {
      return {
        items: nested,
        total: nested.length,
        perPage: nested.length || perPage,
        currentPage: 1,
        lastPage: 1,
      };
    }
  }
  return { items: [], total: 0, perPage, currentPage: page, lastPage: 1 };
}

/** GET /activeCategories — Fetch only active categories (full list, no pagination). */
export async function fetchActiveCategories(): Promise<Category[]> {
  const { data } = await api.get<CategoryListResponse | Category[]>(
    "/activeCategories",
  );
  syncApiImageUrls(data);
  
  if (Array.isArray(data)) return data;
  if (data && typeof data === "object") {
    if (Array.isArray(data.data)) return data.data;
    if (data.data && typeof data.data === "object" && Array.isArray(data.data.data)) {
      return data.data.data;
    }
  }
  return [];
}

/** GET /category/:id — Fetch single category by ID. */
export async function fetchCategoryById(id: number | string): Promise<Category> {
  const { data } = await api.get<CategoryDetailResponse | Category>(`/category/${id}`);
  if (data && typeof data === "object" && "data" in data && data.data) {
    return data.data;
  }
  return data as Category;
}

/** POST /category — Create new category. Image is optional. */
export async function createCategory(payload: CategoryMutationPayload): Promise<unknown> {
  const safeName = (payload.categories_name ?? "").replace(/\//g, "-");
  const safeSlug = (payload.categories_slug ?? "").replace(/\//g, "-");
  const safeSort = String(payload.categories_sort_order ?? "1").replace(/\//g, "-");
  const formData = toFormData({
    parent_id: payload.parent_id ?? "0",
    categories_sort_order: safeSort,
    categories_name: safeName,
    categories_slug: safeSlug,
    ...(payload.categories_image instanceof File
      ? { categories_image: payload.categories_image }
      : {}),
    categories_status: payload.categories_status ?? "Active",
  });

  const { data } = await api.post("/category", formData);
  throwIfApiError(data as { code?: number; message?: string }, "Could not create category.");
  return data;
}

/** PUT /category/:id — Update existing category (using _method: PUT for multipart Laravel support). */
export async function updateCategory(
  id: number | string,
  payload: CategoryMutationPayload,
): Promise<unknown> {
  const safeName = (payload.categories_name ?? "").replace(/\//g, "-");
  const safeSlug = (payload.categories_slug ?? "").replace(/\//g, "-");
  const safeSort = String(payload.categories_sort_order ?? "1").replace(/\//g, "-");
  const formData = toFormData({
    _method: "PUT",
    parent_id: payload.parent_id ?? "0",
    categories_sort_order: safeSort,
    categories_name: safeName,
    categories_slug: safeSlug,
    ...(payload.categories_image instanceof File
      ? { categories_image: payload.categories_image }
      : {}),
    categories_status: payload.categories_status ?? "Active",
  });

  const { data } = await api.post(`/category/${id}`, formData);
  throwIfApiError(data as { code?: number; message?: string }, "Could not update category.");
  return data;
}

/** PATCH /categorys/:id/status — Toggle category status (Active / Inactive). */
export async function updateCategoryStatus(
  id: number | string,
  status: CategoryStatus,
): Promise<unknown> {
  const formData = toFormData({
    _method: "PATCH",
    categories_status: status,
  });

  const { data } = await api.post(`/categorys/${id}/status`, formData);
  throwIfApiError(data as { code?: number; message?: string }, "Could not update category status.");
  return data;
}
