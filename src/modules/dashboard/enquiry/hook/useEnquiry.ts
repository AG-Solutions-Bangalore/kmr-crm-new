import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  deleteEnquiry,
  fetchEnquiries,
  fetchEnquiriesPage,
  fetchEnquiryById,
  updateEnquiryStatus,
} from "../api/enquiry.api.ts";
import type { EnquiryStatus } from "../types/enquiry.types.ts";

export const enquiryKeys = {
  all: ["enquiries"] as const,
  list: () => [...enquiryKeys.all, "list"] as const,
  detail: (id: number | string) => [...enquiryKeys.all, "detail", id] as const,
};

export function useEnquiries() {
  return useQuery({
    queryKey: enquiryKeys.list(),
    queryFn: fetchEnquiries,
    retry: 1,
  });
}

export function useEnquiriesPage(page: number, perPage: number, search = "") {
  return useQuery({
    queryKey: [...enquiryKeys.all, "page", page, perPage, search] as const,
    queryFn: () => fetchEnquiriesPage(page, perPage, search),
    retry: 1,
    placeholderData: keepPreviousData,
  });
}

export function useEnquiry(id: number | string | null | undefined) {
  return useQuery({
    queryKey: enquiryKeys.detail(id ?? ""),
    queryFn: () => fetchEnquiryById(id!),
    enabled: Boolean(id),
  });
}

export function useUpdateEnquiryStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      status,
    }: {
      id: number | string;
      status: EnquiryStatus;
    }) => updateEnquiryStatus(id, status),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: enquiryKeys.all });
    },
  });
}

export function useDeleteEnquiry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number | string) => deleteEnquiry(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: enquiryKeys.all });
    },
  });
}
