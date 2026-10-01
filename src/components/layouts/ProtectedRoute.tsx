import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";
import { getAuthToken } from "@/lib/axios";
import { PATHS } from "@/constants/paths.ts";

export function ProtectedRoute({ children }: { children: ReactNode }) {
  if (!getAuthToken()) {
    return <Navigate to={PATHS.login} replace />;
  }
  return children;
}
