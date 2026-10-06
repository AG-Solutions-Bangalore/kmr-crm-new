import { useMutation } from "@tanstack/react-query";
import { sendPassword } from "../api/auth.api.ts";

export function useForgotPassword() {
  return useMutation({ mutationFn: sendPassword });
}
