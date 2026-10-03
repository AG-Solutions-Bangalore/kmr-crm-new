import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createFaq,
  deleteFaq,
  deleteFaqSub,
  fetchFaqById,
  fetchFaqs,
  fetchFaqsPage,
  fetchPageTwo,
  updateFaq,
  updateFaqStatus,
} from "../api/faq.api.ts";
import type {
  FaqCreatePayload,
  FaqStatus,
  FaqUpdatePayload,
} from "../types/faq.types.ts";

export const faqKeys = {
  all: ["faqs"] as const,
  list: () => [...faqKeys.all, "list"] as const,
  detail: (id: number | string) => [...faqKeys.all, "detail", id] as const,
  pageTwo: () => ["pageTwo"] as const,
};

export function usePageTwoOptions() {
  return useQuery({
    queryKey: faqKeys.pageTwo(),
    queryFn: fetchPageTwo,
    staleTime: 5 * 60 * 1000,
  });
}

export function useFaqs() {
  return useQuery({
    queryKey: faqKeys.list(),
    queryFn: fetchFaqs,
    retry: 1,
  });
}

export function useFaqsPage(page: number, perPage: number, search = "") {
  return useQuery({
    queryKey: [...faqKeys.all, "page", page, perPage, search] as const,
    queryFn: () => fetchFaqsPage(page, perPage, search),
    retry: 1,
    placeholderData: keepPreviousData,
  });
}

export function useFaq(id: number | string | null | undefined) {
  return useQuery({
    queryKey: faqKeys.detail(id ?? ""),
    queryFn: () => fetchFaqById(id!),
    enabled: Boolean(id),
  });
}

export function useCreateFaq() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: FaqCreatePayload) => createFaq(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: faqKeys.all });
    },
  });
}

export function useUpdateFaq() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number | string;
      payload: FaqUpdatePayload;
    }) => updateFaq(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: faqKeys.all });
    },
  });
}

export function useUpdateFaqStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      status,
    }: {
      id: number | string;
      status: FaqStatus;
    }) => updateFaqStatus(id, status),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: faqKeys.all });
    },
  });
}

export function useDeleteFaq() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number | string) => deleteFaq(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: faqKeys.all });
    },
  });
}

export function useDeleteFaqSub() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number | string) => deleteFaqSub(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: faqKeys.all });
    },
  });
}
