export type NotificationStatus = "Active" | "Inactive";

export interface NotificationItem {
  id: number;
  notification_date: string;
  notification_heading: string;
  notification_description: string;
  notification_image?: string | null;
  notification_status?: NotificationStatus | string;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface NotificationImageUrl {
  image_for: string;
  image_url: string;
}

export interface NotificationListResponse {
  code?: number;
  message?: string;
  data?: NotificationItem[] | {
    current_page?: number;
    data: NotificationItem[];
    total?: number;
    per_page?: number;
    last_page?: number;
  };
  image_url?: NotificationImageUrl[];
}

export interface NotificationMutationPayload {
  notification_date: string;
  notification_heading: string;
  notification_description: string;
  notification_image?: File | string | null;
  notification_status?: NotificationStatus | string;
}
