import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
  fetchVendorSpots,
  updateVendor,
  updateVendorSpotStatus,
  updateVendorStatus,
} from "../api/vendor.api.ts";
import type {
  VendorMutationPayload,
  VendorRatePayload,
  VendorSpotPayload,
  VendorStatus,
} from "../types/vendor.types.ts";

export const vendorKeys = {
  all: ["vendors"] as const,
  list: () => [...vendorKeys.all, "list"] as const,
  active: () => [...vendorKeys.all, "active"] as const,
  detail: (id: number | string) => [...vendorKeys.all, "detail", id] as const,
  spots: () => [...vendorKeys.all, "spots"] as const,
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
      void queryClient.invalidateQueries({ queryKey: vendorKeys.all });
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
      void queryClient.invalidateQueries({ queryKey: vendorKeys.all });
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
      void queryClient.invalidateQueries({ queryKey: vendorKeys.all });
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
      void queryClient.invalidateQueries({ queryKey: vendorKeys.spots() });
    },
  });
}

export function useUpdateVendorSpotStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: number | string; status: string }) =>
      updateVendorSpotStatus(id, status),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: vendorKeys.spots() });
    },
  });
}

export function useCreateVendorRate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: VendorRatePayload) => createVendorRate(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: vendorKeys.rates() });
    },
  });
}

export function useCreateVendorLive() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: VendorRatePayload) => createVendorLive(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: vendorKeys.lives() });
    },
  });
}

