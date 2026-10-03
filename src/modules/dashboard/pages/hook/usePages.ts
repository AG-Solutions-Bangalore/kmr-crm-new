import { useQuery } from "@tanstack/react-query";
import { fetchPageOne, fetchPageTwo } from "../api/pages.api.ts";

export const pagesKeys = {
  all: ["pages"] as const,
  pageOne: () => [...pagesKeys.all, "one"] as const,
  pageTwo: () => [...pagesKeys.all, "two"] as const,
};

export function usePageOne() {
  return useQuery({
    queryKey: pagesKeys.pageOne(),
    queryFn: fetchPageOne,
  });
}

export function usePageTwo() {
  return useQuery({
    queryKey: pagesKeys.pageTwo(),
    queryFn: fetchPageTwo,
  });
}
