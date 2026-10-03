export type GalleryStatus = "Active" | "Inactive";

export interface GalleryItem {
  id: number;
  gallery_image: string;
  gallery_url?: string | null;
  gallery_status?: GalleryStatus | string;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface GalleryListResponse {
  code?: number;
  message?: string;
  data?: GalleryItem[] | {
    current_page?: number;
    data: GalleryItem[];
    total?: number;
    per_page?: number;
    last_page?: number;
  };
}

export interface GalleryMutationPayload {
  gallery_image?: File | string | null;
  gallery_status?: GalleryStatus | string;
}
