import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createTestimonial,
  fetchPageOne,
  fetchTestimonialById,
  fetchTestimonials,
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
      void queryClient.invalidateQueries({ queryKey: testimonialKeys.all });
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
      void queryClient.invalidateQueries({ queryKey: testimonialKeys.all });
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
      void queryClient.invalidateQueries({ queryKey: testimonialKeys.all });
    },
  });
}
