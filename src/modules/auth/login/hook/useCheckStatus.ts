import { useQuery } from "@tanstack/react-query";
import { checkStatus } from "../api/auth.api.ts";

export const authKeys = {
  status: ["auth", "status"] as const,
  dotenv: ["auth", "dotenv"] as const,
  profile: ["auth", "profile"] as const,
};

export function useCheckStatus() {
  return useQuery({
    queryKey: authKeys.status,
    queryFn: checkStatus,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}
