import { api, throwIfApiError, toFormData } from "@/lib/axios.ts";
import type {
  Category,
  CategoryDetailResponse,
  CategoryListResponse,
  CategoryMutationPayload,
  CategoryStatus,
} from "../types/category.types.ts";

/** GET /category — Fetch all categories. */
export async function fetchCategories(): Promise<Category[]> {
  // Backend paginates (10/page, 158 total) — ask for all for dropdowns.
  const { data } = await api.get<CategoryListResponse | Category[]>(
    "/category?per_page=500",
  );
  
  if (Array.isArray(data)) return data;
  if (data && typeof data === "object") {
    if (Array.isArray(data.data)) return data.data;
    if (data.data && typeof data.data === "object" && Array.isArray(data.data.data)) {
      return data.data.data;
    }
  }
  return [];
}

/** GET /activeCategories — Fetch only active categories. */
export async function fetchActiveCategories(): Promise<Category[]> {
  const { data } = await api.get<CategoryListResponse | Category[]>(
    "/activeCategories?per_page=500",
  );
  
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

/** POST /category — Create new category. */
export async function createCategory(payload: CategoryMutationPayload): Promise<unknown> {
  const formData = toFormData({
    parent_id: payload.parent_id ?? "0",
    categories_sort_order: payload.categories_sort_order ?? "1",
    categories_name: payload.categories_name,
    categories_slug: payload.categories_slug ?? "",
    categories_image: payload.categories_image ?? "",
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
  const formData = toFormData({
    _method: "PUT",
    parent_id: payload.parent_id ?? "0",
    categories_sort_order: payload.categories_sort_order ?? "1",
    categories_name: payload.categories_name,
    categories_slug: payload.categories_slug ?? "",
    categories_image: payload.categories_image ?? "",
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
