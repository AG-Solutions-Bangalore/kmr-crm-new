import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { getApiErrorMessage } from "@/lib/axios.ts";
import {
  createTestimonial,
  fetchPageOne,
  fetchTestimonialById,
  fetchTestimonials,
  fetchTestimonialsPage,
  updateTestimonial,
  updateTestimonialStatus,
} from "../api/testimonial.api.ts";
import type {
  TestimonialMutationPayload,
  TestimonialStatus,
} from "../types/testimonial.types.ts";

export const testimonialKeys = {
  all: ["testimonials"] as const,
  list: () => [...testimonialKeys.all, "list"] as const,
  detail: (id: number | string) => [...testimonialKeys.all, "detail", id] as const,
  pageOne: () => ["pageOne"] as const,
};

export function usePageOneOptions() {
  return useQuery({
    queryKey: testimonialKeys.pageOne(),
    queryFn: fetchPageOne,
    staleTime: 5 * 60 * 1000,
  });
}

export function useTestimonials() {
  return useQuery({
    queryKey: testimonialKeys.list(),
    queryFn: fetchTestimonials,
    retry: 1,
  });
}

export function useTestimonialsPage(page: number, perPage: number, search = "", status = "all") {
  return useQuery({
    queryKey: [...testimonialKeys.all, "page", page, perPage, search, status] as const,
    queryFn: () => fetchTestimonialsPage(page, perPage, search, status),
    retry: 1,
    placeholderData: keepPreviousData,
  });
}

export function useTestimonial(id: number | string | null | undefined) {
  return useQuery({
    queryKey: testimonialKeys.detail(id ?? ""),
    queryFn: () => fetchTestimonialById(id!),
    enabled: Boolean(id),
  });
}

export function useCreateTestimonial() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: TestimonialMutationPayload) => createTestimonial(payload),
    onSuccess: () => {
      toast.success("Testimonial created successfully.");
      void queryClient.invalidateQueries({ queryKey: testimonialKeys.all });
    },
    onError: (err) => {
      toast.error(getApiErrorMessage(err, "Could not save testimonial."));
    },
  });
}

export function useUpdateTestimonial() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number | string;
      payload: TestimonialMutationPayload;
    }) => updateTestimonial(id, payload),
    onSuccess: () => {
      toast.success("Testimonial updated successfully.");
      void queryClient.invalidateQueries({ queryKey: testimonialKeys.all });
    },
    onError: (err) => {
      toast.error(getApiErrorMessage(err, "Could not save testimonial."));
    },
  });
}

export function useUpdateTestimonialStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      status,
    }: {
      id: number | string;
      status: TestimonialStatus;
    }) => updateTestimonialStatus(id, status),
    onSuccess: () => {
      toast.success("Testimonial status updated.");
      void queryClient.invalidateQueries({ queryKey: testimonialKeys.all });
    },
    onError: (err) => {
      toast.error(getApiErrorMessage(err, "Could not save testimonial."));
    },
  });
}
