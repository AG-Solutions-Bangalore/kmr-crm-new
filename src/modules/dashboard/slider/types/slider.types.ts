export type SliderType = "Home" | "Category";
export type SliderStatus = "Active" | "Inactive";

export interface SliderItem {
  id: number;
  slider_type: SliderType | string;
  category_id?: number | string | null;
  categories_name?: string | null;
  slider_image: string;
  slider_url?: string | null;
  slider_sort_order?: number | string | null;
  slider_status?: SliderStatus | string;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface SliderImageUrl {
  image_for: string;
  image_url: string;
}

export interface SliderListResponse {
  code?: number;
  message?: string;
  data?: SliderItem[] | {
    current_page?: number;
    data: SliderItem[];
    total?: number;
    per_page?: number;
    last_page?: number;
  };
  image_url?: SliderImageUrl[];
}

export interface SliderMutationPayload {
  slider_type: SliderType | string;
  category_id?: number | string | null;
  slider_image?: File | string | null;
  slider_url?: string | null;
  slider_sort_order?: number | string | null;
  slider_status?: SliderStatus | string;
}
