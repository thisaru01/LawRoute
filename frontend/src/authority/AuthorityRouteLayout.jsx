import { Navigate, Outlet, useLocation } from "react-router-dom";

import { AuthorityLayout } from "@/authority/AuthorityLayout";
import { useAuth } from "@/context/auth/useAuth";
import { getDashboardPathForRole } from "@/context/auth/authRouting";

export default function AuthorityRouteLayout() {
  const location = useLocation();
  const { isAuthenticated, role } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace state={{ from: location }} />;
  }

  if (role !== "authority") {
    return <Navigate to={getDashboardPathForRole(role)} replace />;
  }

  return (
    <AuthorityLayout sidebarProps={{ activeHref: location.pathname }}>
      <Outlet />
    </AuthorityLayout>
  );
}
