import { Navigate, Outlet, useLocation } from "react-router-dom";

import { CitizenLayout } from "@/citizen/CitizenLayout";
import { useAuth } from "@/context/auth/useAuth";
import { getDashboardPathForRole } from "@/context/auth/authRouting";

export default function CitizenRouteLayout() {
  const location = useLocation();
  const { isAuthenticated, role } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace state={{ from: location }} />;
  }

  if (role !== "user") {
    return <Navigate to={getDashboardPathForRole(role)} replace />;
  }

  return (
    <CitizenLayout sidebarProps={{ activeHref: location.pathname }}>
      <Outlet />
    </CitizenLayout>
  );
}
