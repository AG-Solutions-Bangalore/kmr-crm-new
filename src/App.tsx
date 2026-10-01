import { Navigate, Route, Routes } from "react-router-dom";
import type { ReactNode } from "react";
import { getAuthToken } from "./lib/axios.ts";
import { LoginPage } from "./modules/auth/login/pages/LoginPage.tsx";
import { ForgotPasswordPage } from "./modules/auth/login/pages/ForgotPasswordPage.tsx";
import { ChangePasswordPage } from "./modules/auth/login/pages/ChangePasswordPage.tsx";
import { ProfilePage } from "./modules/auth/profile/pages/ProfilePage.tsx";

function ProtectedRoute({ children }: { children: ReactNode }) {
  if (!getAuthToken()) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function DashboardPlaceholder() {
  return <div>Dashboard — add pages under src/modules/dashboard/*</div>;
}

function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/change-password" element={<ChangePasswordPage />} />

      {/* Protected */}
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DashboardPlaceholder />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
