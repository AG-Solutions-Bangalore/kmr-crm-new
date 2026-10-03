import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createCategory,
  fetchActiveCategories,
  fetchCategories,
  fetchCategoriesPage,
  fetchCategoryById,
  updateCategory,
  updateCategoryStatus,
} from "../api/category.api.ts";
import type { CategoryMutationPayload, CategoryStatus } from "../types/category.types.ts";

export const categoryKeys = {
  all: ["categories"] as const,
  list: () => [...categoryKeys.all, "list"] as const,
  active: () => [...categoryKeys.all, "active"] as const,
  detail: (id: number | string) => [...categoryKeys.all, "detail", id] as const,
};

export function useCategories() {
  return useQuery({
    queryKey: categoryKeys.list(),
    queryFn: fetchCategories,
    retry: 1,
  });
}

export function useCategoriesPage(page: number, perPage: number) {
  return useQuery({
    queryKey: [...categoryKeys.all, "page", page, perPage] as const,
    queryFn: () => fetchCategoriesPage(page, perPage),
    retry: 1,
    placeholderData: keepPreviousData,
  });
}

export function useActiveCategories() {
  return useQuery({
    queryKey: categoryKeys.active(),
    queryFn: fetchActiveCategories,
    retry: 1,
  });
}

export function useCategory(id: number | string | null | undefined) {
  return useQuery({
    queryKey: categoryKeys.detail(id ?? ""),
    queryFn: () => fetchCategoryById(id!),
    enabled: Boolean(id),
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CategoryMutationPayload) => createCategory(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: categoryKeys.all });
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number | string;
      payload: CategoryMutationPayload;
    }) => updateCategory(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: categoryKeys.all });
    },
  });
}

export function useUpdateCategoryStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      status,
    }: {
      id: number | string;
      status: CategoryStatus;
    }) => updateCategoryStatus(id, status),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: categoryKeys.all });
    },
  });
}
