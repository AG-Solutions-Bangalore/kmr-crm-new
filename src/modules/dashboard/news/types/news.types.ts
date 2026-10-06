export type NewsStatus = "Active" | "Inactive";

export interface NewsItem {
  id: number;
  category_id: number | string;
  categories_name?: string | null;
  news_heading: string;
  news_details: string;
  news_image?: string | null;
  news_other_image?: string | null;
  news_created_date?: string | null;
  news_created_time?: string | null;
  news_status?: NewsStatus | string;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface NewsImageUrl {
  image_for: string;
  image_url: string;
}

export interface NewsListResponse {
  code?: number;
  message?: string;
  data?: NewsItem[] | {
    current_page?: number;
    data: NewsItem[];
    total?: number;
    per_page?: number;
    last_page?: number;
  };
  image_url?: NewsImageUrl[];
}

export interface NewsMutationPayload {
  category_id: number | string;
  news_heading: string;
  news_details: string;
  news_image?: File | string | null;
  news_other_image?: File | string | null;
  news_status?: NewsStatus | string;
}
