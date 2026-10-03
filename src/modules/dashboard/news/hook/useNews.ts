import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { getApiErrorMessage } from "@/lib/axios.ts";
import {
  createNews,
  fetchNews,
  fetchNewsById,
  fetchNewsPage,
  updateNews,
  updateNewsStatus,
} from "../api/news.api.ts";
import type { NewsMutationPayload, NewsStatus } from "../types/news.types.ts";

export const newsKeys = {
  all: ["news"] as const,
  list: () => [...newsKeys.all, "list"] as const,
  detail: (id: number | string) => [...newsKeys.all, "detail", id] as const,
};

export function useNews() {
  return useQuery({
    queryKey: newsKeys.list(),
    queryFn: fetchNews,
    retry: 1,
  });
}

export function useNewsPage(page: number, perPage: number, search = "") {
  return useQuery({
    queryKey: [...newsKeys.all, "page", page, perPage, search] as const,
    queryFn: () => fetchNewsPage(page, perPage, search),
    retry: 1,
    placeholderData: keepPreviousData,
  });
}

export function useNewsItem(id: number | string | null | undefined) {
  return useQuery({
    queryKey: newsKeys.detail(id ?? ""),
    queryFn: () => fetchNewsById(id!),
    enabled: Boolean(id),
  });
}

export function useCreateNews() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: NewsMutationPayload) => createNews(payload),
    onSuccess: () => {
      toast.success("News article created successfully.");
      void queryClient.invalidateQueries({ queryKey: newsKeys.all });
    },
    onError: (err) => {
      toast.error(getApiErrorMessage(err, "Could not save news article."));
    },
  });
}

export function useUpdateNews() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number | string;
      payload: NewsMutationPayload;
    }) => updateNews(id, payload),
    onSuccess: () => {
      toast.success("News article updated successfully.");
      void queryClient.invalidateQueries({ queryKey: newsKeys.all });
    },
    onError: (err) => {
      toast.error(getApiErrorMessage(err, "Could not save news article."));
    },
  });
}

export function useUpdateNewsStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      status,
    }: {
      id: number | string;
      status: NewsStatus;
    }) => updateNewsStatus(id, status),
    onSuccess: () => {
      toast.success("News article status updated.");
      void queryClient.invalidateQueries({ queryKey: newsKeys.all });
    },
    onError: (err) => {
      toast.error(getApiErrorMessage(err, "Could not save news article."));
    },
  });
}
