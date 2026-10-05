import { api, throwIfApiError, toFormData } from "@/lib/axios.ts";
import { pageQuery, parsePaginatedResponse, type PagedResult } from "@/lib/pagination.ts";
import type {
  NotificationItem,
  NotificationListResponse,
  NotificationMutationPayload,
  NotificationStatus,
} from "../types/notification.types.ts";

/** GET /notification — Fetch all notifications. */
export async function fetchNotifications(): Promise<NotificationItem[]> {
  const { data } = await api.get<NotificationListResponse | NotificationItem[]>("/notification");
  if (Array.isArray(data)) return data;
  if (data && typeof data === "object") {
    if (Array.isArray(data.data)) return data.data;
    if (data.data && typeof data.data === "object" && Array.isArray(data.data.data)) {
      return data.data.data;
    }
  }
  return [];
}

/** GET /notification?page=N&per_page=M&search=Q&status=S — Server-side paginated notifications. */
export async function fetchNotificationsPage(
  page = 1,
  perPage = 10,
  search = "",
  status = "all",
): Promise<PagedResult<NotificationItem>> {
  const { data } = await api.get<NotificationListResponse | NotificationItem[]>(
    pageQuery("/notification", page, perPage, search, status),
  );
  return parsePaginatedResponse<NotificationItem>(data, page, perPage);
}

/** GET /notification/:id — Fetch single notification. */
export async function fetchNotificationById(id: number | string): Promise<NotificationItem> {
  const { data } = await api.get<{ data?: NotificationItem } | NotificationItem>(`/notification/${id}`);
  if (data && typeof data === "object" && "data" in data && data.data) {
    return data.data;
  }
  return data as NotificationItem;
}

/** POST /notification — Schedule/send new notification. */
export async function createNotification(payload: NotificationMutationPayload): Promise<unknown> {
  const formData = toFormData({
    notification_date: payload.notification_date,
    notification_heading: payload.notification_heading,
    notification_description: payload.notification_description,
    ...(payload.notification_image instanceof File
      ? { notification_image: payload.notification_image }
      : {}),
    notification_status: payload.notification_status ?? "Active",
  });

  const { data } = await api.post("/notification", formData);
  throwIfApiError(data as { code?: number; message?: string }, "Could not create notification.");
  return data;
}

/** PUT /notification/:id — Update notification. */
export async function updateNotification(
  id: number | string,
  payload: NotificationMutationPayload,
): Promise<unknown> {
  // Omit image when unchanged — sending "" trips backend
  // "The notification image field is required." on update.
  const formData = toFormData({
    _method: "PUT",
    notification_date: payload.notification_date,
    notification_heading: payload.notification_heading,
    notification_description: payload.notification_description,
    ...(payload.notification_image instanceof File
      ? { notification_image: payload.notification_image }
      : {}),
    notification_status: payload.notification_status ?? "Active",
  });

  const { data } = await api.post(`/notification/${id}`, formData);
  throwIfApiError(data as { code?: number; message?: string }, "Could not update notification.");
  return data;
}

/** PATCH /notifications/:id/status — Toggle notification status. */
export async function updateNotificationStatus(
  id: number | string,
  status: NotificationStatus,
): Promise<unknown> {
  const formData = toFormData({
    _method: "PATCH",
    notification_status: status,
  });

  const { data } = await api.post(`/notifications/${id}/status`, formData);
  throwIfApiError(data as { code?: number; message?: string }, "Could not update notification status.");
  return data;
}
