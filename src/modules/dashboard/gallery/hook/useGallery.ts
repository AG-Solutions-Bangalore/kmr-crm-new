import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createGallery,
  fetchGallery,
  fetchGalleryById,
  fetchGalleryPage,
  updateGallery,
  updateGalleryStatus,
} from "../api/gallery.api.ts";
import type { GalleryMutationPayload, GalleryStatus } from "../types/gallery.types.ts";

export const galleryKeys = {
  all: ["gallery"] as const,
  list: () => [...galleryKeys.all, "list"] as const,
  detail: (id: number | string) => [...galleryKeys.all, "detail", id] as const,
};

export function useGalleryList() {
  return useQuery({
    queryKey: galleryKeys.list(),
    queryFn: fetchGallery,
    retry: 1,
  });
}

export function useGalleryPage(page: number, perPage: number, search = "") {
  return useQuery({
    queryKey: [...galleryKeys.all, "page", page, perPage, search] as const,
    queryFn: () => fetchGalleryPage(page, perPage, search),
    retry: 1,
    placeholderData: keepPreviousData,
  });
}

export function useGalleryItem(id: number | string | null | undefined) {
  return useQuery({
    queryKey: galleryKeys.detail(id ?? ""),
    queryFn: () => fetchGalleryById(id!),
    enabled: Boolean(id),
  });
}

export function useCreateGallery() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: GalleryMutationPayload) => createGallery(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: galleryKeys.all });
    },
  });
}

export function useUpdateGallery() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number | string;
      payload: GalleryMutationPayload;
    }) => updateGallery(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: galleryKeys.all });
    },
  });
}

export function useUpdateGalleryStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      status,
    }: {
      id: number | string;
      status: GalleryStatus;
    }) => updateGalleryStatus(id, status),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: galleryKeys.all });
    },
  });
}
