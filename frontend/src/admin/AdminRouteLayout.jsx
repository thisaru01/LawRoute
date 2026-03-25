import { Navigate, Outlet, useLocation } from "react-router-dom";

import { AdminLayout } from "@/admin/AdminLayout";
import { useAuth } from "@/context/auth/useAuth";
import { getDashboardPathForRole } from "@/context/auth/authRouting";

export default function AdminRouteLayout() {
  const location = useLocation();
  const { isAuthenticated, role } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace state={{ from: location }} />;
  }

  if (role !== "admin") {
    return <Navigate to={getDashboardPathForRole(role)} replace />;
  }

  return (
    <AdminLayout sidebarProps={{ activeHref: location.pathname }}>
      <Outlet />
    </AdminLayout>
  );
}
