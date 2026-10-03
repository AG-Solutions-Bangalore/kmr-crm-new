export type BlogStatus = "Active" | "Inactive";

export interface BlogItem {
  id: number;
  blog_title: string;
  blog_slug?: string | null;
  blog_short_description?: string | null;
  blog_description?: string | null;
  blog_meta_title?: string | null;
  blog_meta_description?: string | null;
  blog_meta_keywords?: string | null;
  blog_banner_image?: string | null;
  blog_banner_image_alt?: string | null;
  blog_categories_ids?: string | null;
  categories?: string | null;
  blog_front?: string | number | null;
  blog_featured?: string | number | null;
  blog_index?: string | null;
  blog_status?: BlogStatus | string;
  blog_created_date?: string | null;
  blog_updated_date?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface BlogImageUrl {
  image_for: string;
  image_url: string;
}

export interface BlogListResponse {
  code?: number;
  message?: string;
  data?: BlogItem[] | {
    current_page?: number;
    data: BlogItem[];
    total?: number;
    per_page?: number;
    last_page?: number;
  };
  image_url?: BlogImageUrl[];
}

export interface BlogMutationPayload {
  blog_title: string;
  blog_slug: string;
  blog_short_description: string;
  blog_description: string;
  blog_meta_keywords?: string;
  blog_banner_image?: File | string | null;
  blog_banner_image_alt?: string;
  blog_categories_ids?: string;
  blog_front?: string | number;
  blog_featured?: string | number;
  blog_index?: string;
  blog_status?: BlogStatus | string;
}
