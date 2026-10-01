import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Data stays fresh for 1 min, cached for 5 min
      staleTime: 60 * 1000,
      gcTime: 5 * 60 * 1000,
      // Don't refetch on window focus by default (calmer CRM UX)
      refetchOnWindowFocus: false,
      // Retry once on failure, then surface the error
      retry: 1,
    },
    mutations: {
      retry: 0,
    },
  },
});
