import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { getApiErrorMessage } from "@/lib/axios.ts";
import {
  createClient,
  fetchClientById,
  fetchClients,
  fetchClientsPage,
  updateClient,
  updateClientStatus,
} from "../api/client.api.ts";
import type { ClientMutationPayload, ClientStatus } from "../types/client.types.ts";

export const clientKeys = {
  all: ["clients"] as const,
  list: () => [...clientKeys.all, "list"] as const,
  detail: (id: number | string) => [...clientKeys.all, "detail", id] as const,
};

export function useClients() {
  return useQuery({
    queryKey: clientKeys.list(),
    queryFn: fetchClients,
    retry: 1,
  });
}

export function useClientsPage(page: number, perPage: number, search = "") {
  return useQuery({
    queryKey: [...clientKeys.all, "page", page, perPage, search] as const,
    queryFn: () => fetchClientsPage(page, perPage, search),
    retry: 1,
    placeholderData: keepPreviousData,
  });
}

export function useClient(id: number | string | null | undefined) {
  return useQuery({
    queryKey: clientKeys.detail(id ?? ""),
    queryFn: () => fetchClientById(id!),
    enabled: Boolean(id),
  });
}

export function useCreateClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ClientMutationPayload) => createClient(payload),
    onSuccess: () => {
      toast.success("Client created successfully.");
      void queryClient.invalidateQueries({ queryKey: clientKeys.all });
    },
    onError: (err) => {
      toast.error(getApiErrorMessage(err, "Could not save client."));
    },
  });
}

export function useUpdateClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number | string;
      payload: ClientMutationPayload;
    }) => updateClient(id, payload),
    onSuccess: () => {
      toast.success("Client updated successfully.");
      void queryClient.invalidateQueries({ queryKey: clientKeys.all });
    },
    onError: (err) => {
      toast.error(getApiErrorMessage(err, "Could not save client."));
    },
  });
}

export function useUpdateClientStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      status,
    }: {
      id: number | string;
      status: ClientStatus;
    }) => updateClientStatus(id, status),
    onSuccess: () => {
      toast.success("Client status updated.");
      void queryClient.invalidateQueries({ queryKey: clientKeys.all });
    },
    onError: (err) => {
      toast.error(getApiErrorMessage(err, "Could not save client."));
    },
  });
}
