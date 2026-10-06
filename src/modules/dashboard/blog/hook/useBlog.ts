import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { getApiErrorMessage } from "@/lib/axios.ts";
import {
  createBlog,
  fetchBlogById,
  fetchBlogs,
  fetchBlogsPage,
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

export function useBlogsPage(page: number, perPage: number, search = "", status = "all") {
  return useQuery({
    queryKey: [...blogKeys.all, "page", page, perPage, search, status] as const,
    queryFn: () => fetchBlogsPage(page, perPage, search, status),
    retry: 1,
    placeholderData: keepPreviousData,
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
      toast.success("Blog post created successfully.");
      void queryClient.invalidateQueries({ queryKey: blogKeys.all });
    },
    onError: (err) => {
      toast.error(getApiErrorMessage(err, "Could not save blog post."));
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
      toast.success("Blog post updated successfully.");
      void queryClient.invalidateQueries({ queryKey: blogKeys.all });
    },
    onError: (err) => {
      toast.error(getApiErrorMessage(err, "Could not save blog post."));
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
      toast.success("Blog post status updated.");
      void queryClient.invalidateQueries({ queryKey: blogKeys.all });
    },
    onError: (err) => {
      toast.error(getApiErrorMessage(err, "Could not save blog post."));
    },
  });
}
