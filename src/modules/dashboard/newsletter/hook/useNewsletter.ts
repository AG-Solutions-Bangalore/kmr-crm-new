import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  deleteNewsletterSubscriber,
  fetchNewsletterSubscribers,
  fetchNewsletterSubscribersPage,
} from "../api/newsletter.api.ts";

export const newsletterKeys = {
  all: ["newsletter"] as const,
  list: () => [...newsletterKeys.all, "list"] as const,
};

export function useNewsletterSubscribers() {
  return useQuery({
    queryKey: newsletterKeys.list(),
    queryFn: fetchNewsletterSubscribers,
    retry: 1,
  });
}

export function useNewsletterSubscribersPage(page: number, perPage: number, search = "") {
  return useQuery({
    queryKey: [...newsletterKeys.all, "page", page, perPage, search] as const,
    queryFn: () => fetchNewsletterSubscribersPage(page, perPage, search),
    retry: 1,
    placeholderData: keepPreviousData,
  });
}

export function useDeleteNewsletterSubscriber() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number | string) => deleteNewsletterSubscriber(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: newsletterKeys.all });
    },
  });
}
