import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { getApiErrorMessage } from "@/lib/axios.ts";
import {
  createVendor,
  createVendorLive,
  createVendorRate,
  createVendorSpot,
  fetchActiveVendors,
  fetchVendorById,
  fetchVendorLives,
  fetchVendorRates,
  fetchVendors,
  fetchVendorsPage,
  fetchVendorSpotById,
  fetchVendorSpots,
  updateVendor,
  updateVendorLiveStatus,
  updateVendorRateStatus,
  updateVendorSpot,
  updateVendorSpotStatus,
  updateVendorStatus,
} from "../api/vendor.api.ts";
import type {
  VendorMutationPayload,
  VendorRatePayload,
  VendorSpotPayload,
  VendorSpotUpdatePayload,
  VendorStatus,
} from "../types/vendor.types.ts";

export const vendorKeys = {
  all: ["vendors"] as const,
  list: () => [...vendorKeys.all, "list"] as const,
  active: () => [...vendorKeys.all, "active"] as const,
  detail: (id: number | string) => [...vendorKeys.all, "detail", id] as const,
  spots: () => [...vendorKeys.all, "spots"] as const,
  spotDetail: (id: number | string) => [...vendorKeys.all, "spot", id] as const,
  lives: () => [...vendorKeys.all, "lives"] as const,
  rates: () => [...vendorKeys.all, "rates"] as const,
};

export function useVendors() {
  return useQuery({
    queryKey: vendorKeys.list(),
    queryFn: fetchVendors,
    retry: 1,
  });
}

export function useVendorsPage(page: number, perPage: number, search = "", status = "all") {
  return useQuery({
    queryKey: [...vendorKeys.all, "page", page, perPage, search, status] as const,
    queryFn: () => fetchVendorsPage(page, perPage, search, status),
    retry: 1,
    placeholderData: keepPreviousData,
  });
}

export function useActiveVendors() {
  return useQuery({
    queryKey: vendorKeys.active(),
    queryFn: fetchActiveVendors,
    retry: 1,
  });
}

export function useVendor(id: number | string | null | undefined) {
  return useQuery({
    queryKey: vendorKeys.detail(id ?? ""),
    queryFn: () => fetchVendorById(id!),
    enabled: Boolean(id),
  });
}

export function useVendorSpots() {
  return useQuery({
    queryKey: vendorKeys.spots(),
    queryFn: fetchVendorSpots,
    retry: 1,
  });
}

export function useVendorLives() {
  return useQuery({
    queryKey: vendorKeys.lives(),
    queryFn: fetchVendorLives,
    retry: 1,
  });
}

export function useCreateVendor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: VendorMutationPayload) => createVendor(payload),
    onSuccess: () => {
      toast.success("Vendor created");
      void queryClient.invalidateQueries({ queryKey: vendorKeys.all });
    },
    onError: (err) => {
      toast.error(getApiErrorMessage(err, "Failed to create vendor."));
    },
  });
}

export function useUpdateVendor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number | string;
      payload: VendorMutationPayload;
    }) => updateVendor(id, payload),
    onSuccess: () => {
      toast.success("Vendor updated");
      void queryClient.invalidateQueries({ queryKey: vendorKeys.all });
    },
    onError: (err) => {
      toast.error(getApiErrorMessage(err, "Failed to update vendor."));
    },
  });
}

export function useUpdateVendorStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      status,
    }: {
      id: number | string;
      status: VendorStatus;
    }) => updateVendorStatus(id, status),
    onSuccess: () => {
      toast.success("Vendor status updated");
      void queryClient.invalidateQueries({ queryKey: vendorKeys.all });
    },
    onError: (err) => {
      toast.error(getApiErrorMessage(err, "Failed to update vendor status."));
    },
  });
}

export function useVendorRates() {
  return useQuery({
    queryKey: vendorKeys.rates(),
    queryFn: fetchVendorRates,
    retry: 1,
  });
}

export function useCreateVendorSpot() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: VendorSpotPayload) => createVendorSpot(payload),
    onSuccess: () => {
      toast.success("Vendor spot created");
      void queryClient.invalidateQueries({ queryKey: vendorKeys.spots() });
    },
    onError: (err) => {
      toast.error(getApiErrorMessage(err, "Failed to create vendor spot."));
    },
  });
}

export function useVendorSpot(id: number | string | null | undefined) {
  return useQuery({
    queryKey: vendorKeys.spotDetail(id ?? ""),
    queryFn: () => fetchVendorSpotById(id!),
    enabled: Boolean(id),
  });
}

export function useUpdateVendorSpot() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number | string;
      payload: VendorSpotUpdatePayload;
    }) => updateVendorSpot(id, payload),
    onSuccess: () => {
      toast.success("Vendor spot updated");
      void queryClient.invalidateQueries({ queryKey: vendorKeys.spots() });
    },
    onError: (err) => {
      toast.error(getApiErrorMessage(err, "Failed to update vendor spot."));
    },
  });
}

export function useUpdateVendorSpotStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: number | string; status: string }) =>
      updateVendorSpotStatus(id, status),
    onSuccess: () => {
      toast.success("Vendor spot status updated");
      void queryClient.invalidateQueries({ queryKey: vendorKeys.spots() });
    },
    onError: (err) => {
      toast.error(getApiErrorMessage(err, "Failed to update vendor spot status."));
    },
  });
}

export function useCreateVendorRate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: VendorRatePayload) => createVendorRate(payload),
    onSuccess: () => {
      toast.success("Vendor rate created");
      void queryClient.invalidateQueries({ queryKey: vendorKeys.rates() });
    },
    onError: (err) => {
      toast.error(getApiErrorMessage(err, "Failed to create vendor rate."));
    },
  });
}

export function useCreateVendorLive() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: VendorRatePayload) => createVendorLive(payload),
    onSuccess: () => {
      toast.success("Vendor live rate created");
      void queryClient.invalidateQueries({ queryKey: vendorKeys.lives() });
    },
    onError: (err) => {
      toast.error(getApiErrorMessage(err, "Failed to create vendor live rate."));
    },
  });
}

export function useUpdateVendorLiveStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: number | string; status: string }) =>
      updateVendorLiveStatus(id, status),
    onSuccess: () => {
      toast.success("Live rate status updated");
      void queryClient.invalidateQueries({ queryKey: vendorKeys.lives() });
    },
    onError: (err) => {
      toast.error(getApiErrorMessage(err, "Failed to update live rate status."));
    },
  });
}

export function useUpdateVendorRateStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: number | string; status: string }) =>
      updateVendorRateStatus(id, status),
    onSuccess: () => {
      toast.success("Standard rate status updated");
      void queryClient.invalidateQueries({ queryKey: vendorKeys.rates() });
    },
    onError: (err) => {
      toast.error(getApiErrorMessage(err, "Failed to update rate status."));
    },
  });
}

