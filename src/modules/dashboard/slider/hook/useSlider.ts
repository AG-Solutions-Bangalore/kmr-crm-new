import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { getApiErrorMessage } from "@/lib/axios.ts";
import {
  createSlider,
  fetchSliderById,
  fetchSliders,
  fetchSlidersPage,
  updateSlider,
  updateSliderStatus,
} from "../api/slider.api.ts";
import type { SliderMutationPayload, SliderStatus } from "../types/slider.types.ts";

export const sliderKeys = {
  all: ["sliders"] as const,
  list: () => [...sliderKeys.all, "list"] as const,
  detail: (id: number | string) => [...sliderKeys.all, "detail", id] as const,
};

export function useSliders() {
  return useQuery({
    queryKey: sliderKeys.list(),
    queryFn: fetchSliders,
    retry: 1,
  });
}

export function useSlidersPage(page: number, perPage: number, search = "", status = "all", type = "all") {
  return useQuery({
    queryKey: [...sliderKeys.all, "page", page, perPage, search, status, type] as const,
    queryFn: () => fetchSlidersPage(page, perPage, search, status, type),
    retry: 1,
    placeholderData: keepPreviousData,
  });
}

export function useSlider(id: number | string | null | undefined) {
  return useQuery({
    queryKey: sliderKeys.detail(id ?? ""),
    queryFn: () => fetchSliderById(id!),
    enabled: Boolean(id),
  });
}

export function useCreateSlider() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SliderMutationPayload) => createSlider(payload),
    onSuccess: () => {
      toast.success("Slider banner created successfully.");
      void queryClient.invalidateQueries({ queryKey: sliderKeys.all });
    },
    onError: (err) => {
      toast.error(getApiErrorMessage(err, "Could not save slider banner."));
    },
  });
}

export function useUpdateSlider() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number | string;
      payload: SliderMutationPayload;
    }) => updateSlider(id, payload),
    onSuccess: () => {
      toast.success("Slider banner updated successfully.");
      void queryClient.invalidateQueries({ queryKey: sliderKeys.all });
    },
    onError: (err) => {
      toast.error(getApiErrorMessage(err, "Could not save slider banner."));
    },
  });
}

export function useUpdateSliderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      status,
    }: {
      id: number | string;
      status: SliderStatus;
    }) => updateSliderStatus(id, status),
    onSuccess: () => {
      toast.success("Slider banner status updated.");
      void queryClient.invalidateQueries({ queryKey: sliderKeys.all });
    },
    onError: (err) => {
      toast.error(getApiErrorMessage(err, "Could not save slider banner."));
    },
  });
}
