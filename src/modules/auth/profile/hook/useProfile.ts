import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authKeys } from "../../login/hook/useCheckStatus.ts";
import { fetchProfile, updateProfile } from "../api/profile.api.ts";

export function useProfile() {
  return useQuery({
    queryKey: authKeys.profile,
    queryFn: fetchProfile,
    retry: 1,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateProfile,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: authKeys.profile });
    },
  });
}
