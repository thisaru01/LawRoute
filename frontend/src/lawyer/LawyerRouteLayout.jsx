import { Navigate, Outlet, useLocation } from "react-router-dom";

import { LawyerLayout } from "@/lawyer/LawyerLayout";
import { useAuth } from "@/context/auth/useAuth";
import { getDashboardPathForRole } from "@/context/auth/authRouting";

export default function LawyerRouteLayout() {
  const location = useLocation();
  const { isAuthenticated, role } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace state={{ from: location }} />;
  }

  if (role !== "lawyer") {
    return <Navigate to={getDashboardPathForRole(role)} replace />;
  }

  return (
    <LawyerLayout sidebarProps={{ activeHref: location.pathname }}>
      <Outlet />
    </LawyerLayout>
  );
}
