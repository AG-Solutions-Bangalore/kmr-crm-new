import { useMutation, useQueryClient } from "@tanstack/react-query";
import { clearAuthToken } from "@/lib/axios";
import { logout } from "../api/auth.api.ts";

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logout,
    onSettled: () => {
      // Always drop the local session, even if the server call fails
      clearAuthToken();
      queryClient.clear();
    },
  });
}
