import { Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { ProtectedRoute } from "./components/layouts/ProtectedRoute.tsx";
import { SuperAdminRoute } from "./components/layouts/SuperAdminRoute.tsx";
import { DashboardLayout } from "./components/layouts/DashboardLayout.tsx";
import { PATHS } from "./constants/paths.ts";
import { dashboardRoutes, publicRoutes } from "./routes.tsx";

function App() {
  return (
    <>
      <Toaster position="top-right" reverseOrder={false} />
      <Routes>
      {publicRoutes.map((route) => (
        <Route key={route.path} path={route.path} element={route.element} />
      ))}

      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        {dashboardRoutes.map((route) => (
          <Route
            key={route.path}
            path={route.path}
            element={
              route.superAdminOnly ? (
                <SuperAdminRoute>{route.element}</SuperAdminRoute>
              ) : (
                route.element
              )
            }
          />
        ))}
      </Route>

      <Route path="*" element={<Navigate to={PATHS.overview} replace />} />
      </Routes>
    </>
  );
}

export default App;
