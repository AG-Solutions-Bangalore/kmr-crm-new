import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createBlog,
  fetchBlogById,
  fetchBlogs,
  updateBlog,
  updateBlogStatus,
} from "../api/blog.api.ts";
import type { BlogMutationPayload, BlogStatus } from "../types/blog.types.ts";

export const blogKeys = {
  all: ["blogs"] as const,
  list: () => [...blogKeys.all, "list"] as const,
  detail: (id: number | string) => [...blogKeys.all, "detail", id] as const,
};

export function useBlogs() {
  return useQuery({
    queryKey: blogKeys.list(),
    queryFn: fetchBlogs,
    retry: 1,
  });
}

export function useBlog(id: number | string | null | undefined) {
  return useQuery({
    queryKey: blogKeys.detail(id ?? ""),
    queryFn: () => fetchBlogById(id!),
    enabled: Boolean(id),
  });
}

export function useCreateBlog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: BlogMutationPayload) => createBlog(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: blogKeys.all });
    },
  });
}

export function useUpdateBlog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number | string;
      payload: BlogMutationPayload;
    }) => updateBlog(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: blogKeys.all });
    },
  });
}

export function useUpdateBlogStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      status,
    }: {
      id: number | string;
      status: BlogStatus;
    }) => updateBlogStatus(id, status),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: blogKeys.all });
    },
  });
}
