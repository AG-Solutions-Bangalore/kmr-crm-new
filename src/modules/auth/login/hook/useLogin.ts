import { useMutation, useQueryClient } from "@tanstack/react-query";
import { setAuthToken } from "@/lib/axios";
import { login } from "../api/auth.api.ts";
import { authKeys } from "./useCheckStatus.ts";

export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      // Persist session token so the axios interceptor attaches it
      setAuthToken(data.UserInfo.token);
      // Refresh the cached profile for the newly logged-in user
      void queryClient.invalidateQueries({ queryKey: authKeys.profile });
    },
  });
}
