import { Outlet, useLocation } from "react-router-dom";

import { AdminLayout } from "@/admin/AdminLayout";

export default function AdminRouteLayout() {
  const location = useLocation();

  return (
    <AdminLayout sidebarProps={{ activeHref: location.pathname }}>
      <Outlet />
    </AdminLayout>
  );
}
