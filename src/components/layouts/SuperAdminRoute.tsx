import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";
import { useCurrentUser } from "@/modules/auth/login/hook/useCurrentUser.ts";
import { PATHS } from "@/constants/paths.ts";

export function SuperAdminRoute({ children }: { children: ReactNode }) {
  const { isSuperAdmin } = useCurrentUser();
  if (!isSuperAdmin) {
    return <Navigate to={PATHS.overview} replace />;
  }
  return children;
}
