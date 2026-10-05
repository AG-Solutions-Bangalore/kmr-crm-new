import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { getApiErrorMessage } from "@/lib/axios.ts";
import {
  createNotification,
  fetchNotificationById,
  fetchNotifications,
  fetchNotificationsPage,
  updateNotification,
  updateNotificationStatus,
} from "../api/notification.api.ts";
import type { NotificationMutationPayload, NotificationStatus } from "../types/notification.types.ts";

export const notificationKeys = {
  all: ["notifications"] as const,
  list: () => [...notificationKeys.all, "list"] as const,
  detail: (id: number | string) => [...notificationKeys.all, "detail", id] as const,
};

export function useNotifications() {
  return useQuery({
    queryKey: notificationKeys.list(),
    queryFn: fetchNotifications,
    retry: 1,
  });
}

export function useNotificationsPage(page: number, perPage: number, search = "", status = "all") {
  return useQuery({
    queryKey: [...notificationKeys.all, "page", page, perPage, search, status] as const,
    queryFn: () => fetchNotificationsPage(page, perPage, search, status),
    retry: 1,
    placeholderData: keepPreviousData,
  });
}

export function useNotificationItem(id: number | string | null | undefined) {
  return useQuery({
    queryKey: notificationKeys.detail(id ?? ""),
    queryFn: () => fetchNotificationById(id!),
    enabled: Boolean(id),
  });
}

export function useCreateNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: NotificationMutationPayload) => createNotification(payload),
    onSuccess: () => {
      toast.success("Notification created successfully.");
      void queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
    onError: (err) => {
      toast.error(getApiErrorMessage(err, "Could not save notification."));
    },
  });
}

export function useUpdateNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number | string;
      payload: NotificationMutationPayload;
    }) => updateNotification(id, payload),
    onSuccess: () => {
      toast.success("Notification updated successfully.");
      void queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
    onError: (err) => {
      toast.error(getApiErrorMessage(err, "Could not save notification."));
    },
  });
}

export function useUpdateNotificationStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      status,
    }: {
      id: number | string;
      status: NotificationStatus;
    }) => updateNotificationStatus(id, status),
    onSuccess: () => {
      toast.success("Notification status updated.");
      void queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
    onError: (err) => {
      toast.error(getApiErrorMessage(err, "Could not save notification."));
    },
  });
}
