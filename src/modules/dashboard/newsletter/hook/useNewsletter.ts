import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  deleteNewsletterSubscriber,
  fetchNewsletterSubscribers,
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

export function useDeleteNewsletterSubscriber() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number | string) => deleteNewsletterSubscriber(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: newsletterKeys.all });
    },
  });
}
