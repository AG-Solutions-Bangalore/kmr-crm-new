import { useQuery } from "@tanstack/react-query";
import { fetchDotenv } from "../api/auth.api.ts";
import { authKeys } from "./useCheckStatus.ts";

export function useDotenv() {
  return useQuery({
    queryKey: authKeys.dotenv,
    queryFn: fetchDotenv,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}
