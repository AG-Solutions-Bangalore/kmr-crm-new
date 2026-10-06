export type CategoryStatus = "Active" | "Inactive";

export interface Category {
  id: number;
  parent_id?: number | string | null;
  categories_sort_order?: number | string | null;
  categories_name: string;
  categories_slug?: string | null;
  categories_image?: string | null;
  categories_status?: CategoryStatus | string;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface CategoryImageUrl {
  image_for: string;
  image_url: string;
}

export interface CategoryListResponse {
  code?: number;
  message?: string;
  data?: Category[] | {
    current_page?: number;
    data: Category[];
    total?: number;
    per_page?: number;
    last_page?: number;
  };
  image_url?: CategoryImageUrl[];
}

export interface CategoryDetailResponse {
  code?: number;
  message?: string;
  data?: Category;
}

export interface CategoryMutationPayload {
  parent_id?: string | number;
  categories_sort_order?: string | number;
  categories_name: string;
  categories_slug?: string;
  categories_image?: File | string | null;
  categories_status?: CategoryStatus | string;
}

export interface CategoryStatusPayload {
  categories_status: CategoryStatus;
}
