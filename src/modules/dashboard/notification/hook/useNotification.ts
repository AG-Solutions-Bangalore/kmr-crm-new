import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createNotification,
  fetchNotificationById,
  fetchNotifications,
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
      void queryClient.invalidateQueries({ queryKey: notificationKeys.all });
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
      void queryClient.invalidateQueries({ queryKey: notificationKeys.all });
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
      void queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
}
