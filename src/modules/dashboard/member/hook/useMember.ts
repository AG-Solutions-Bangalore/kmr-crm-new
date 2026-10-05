import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { getApiErrorMessage } from "@/lib/axios.ts";
import {
  createMember,
  fetchMemberById,
  fetchMembers,
  fetchMembersPage,
  fetchTrailMembersPage,
  updateMember,
  updateMemberStatus,
} from "../api/member.api.ts";
import type { MemberItem, MemberMutationPayload, MemberStatus } from "../types/member.types.ts";

export const memberKeys = {
  all: ["members"] as const,
  list: () => [...memberKeys.all, "list"] as const,
  detail: (id: number | string) => [...memberKeys.all, "detail", id] as const,
};

export function useMembers() {
  return useQuery({
    queryKey: memberKeys.list(),
    queryFn: fetchMembers,
    retry: 1,
  });
}

export function useMembersPage(page: number, perPage: number, search = "") {
  return useQuery({
    queryKey: [...memberKeys.all, "page", page, perPage, search] as const,
    queryFn: () => fetchMembersPage(page, perPage, search),
    retry: 1,
    placeholderData: keepPreviousData,
  });
}

export function useTrailMembersPage(page: number, perPage: number, search = "") {
  return useQuery({
    queryKey: [...memberKeys.all, "trail", page, perPage, search] as const,
    queryFn: () => fetchTrailMembersPage(page, perPage, search),
    retry: 1,
    placeholderData: keepPreviousData,
  });
}

export function useMember(id: number | string | null | undefined) {
  return useQuery({
    queryKey: memberKeys.detail(id ?? ""),
    queryFn: () => fetchMemberById(id!),
    enabled: Boolean(id),
  });
}

export function useCreateMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: MemberMutationPayload) => createMember(payload),
    onSuccess: () => {
      toast.success("Member created successfully.");
      void queryClient.invalidateQueries({ queryKey: memberKeys.all });
    },
    onError: (err) => {
      toast.error(getApiErrorMessage(err, "Could not save member."));
    },
  });
}

export function useUpdateMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number | string;
      payload: MemberMutationPayload;
    }) => updateMember(id, payload),
    onSuccess: () => {
      toast.success("Member updated successfully.");
      void queryClient.invalidateQueries({ queryKey: memberKeys.all });
    },
    onError: (err) => {
      toast.error(getApiErrorMessage(err, "Could not save member."));
    },
  });
}

export function useUpdateMemberStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      current,
      status,
    }: {
      id: number | string;
      current: MemberItem;
      status: MemberStatus;
    }) => updateMemberStatus(id, current, status),
    onSuccess: () => {
      toast.success("Member status updated.");
      void queryClient.invalidateQueries({ queryKey: memberKeys.all });
    },
    onError: (err) => {
      toast.error(getApiErrorMessage(err, "Could not update member status."));
    },
  });
}
