import { Navigate, useNavigate } from "react-router-dom";
import { getAuthToken } from "@/lib/axios";
import { LoginForm } from "../components/LoginForm.tsx";

export function LoginPage() {
  const navigate = useNavigate();

  if (getAuthToken()) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <LoginForm onSuccess={() => navigate("/", { replace: true })} />
    </div>
  );
}
