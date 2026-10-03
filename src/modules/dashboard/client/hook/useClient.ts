import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createClient,
  fetchClientById,
  fetchClients,
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
      void queryClient.invalidateQueries({ queryKey: clientKeys.all });
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
      void queryClient.invalidateQueries({ queryKey: clientKeys.all });
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
      void queryClient.invalidateQueries({ queryKey: clientKeys.all });
    },
  });
}
