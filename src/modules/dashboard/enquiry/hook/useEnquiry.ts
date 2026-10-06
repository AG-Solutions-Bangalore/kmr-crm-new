import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { getApiErrorMessage } from "@/lib/axios.ts";
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

export function useEnquiriesPage(page: number, perPage: number, search = "", status = "all") {
  return useQuery({
    queryKey: [...enquiryKeys.all, "page", page, perPage, search, status] as const,
    queryFn: () => fetchEnquiriesPage(page, perPage, search, status),
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
      toast.success("Enquiry status updated");
      void queryClient.invalidateQueries({ queryKey: enquiryKeys.all });
    },
    onError: (err) => {
      toast.error(getApiErrorMessage(err, "Failed to update enquiry status."));
    },
  });
}

export function useDeleteEnquiry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number | string) => deleteEnquiry(id),
    onSuccess: () => {
      toast.success("Enquiry deleted");
      void queryClient.invalidateQueries({ queryKey: enquiryKeys.all });
    },
    onError: (err) => {
      toast.error(getApiErrorMessage(err, "Failed to delete enquiry."));
    },
  });
}
