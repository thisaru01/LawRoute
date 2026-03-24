import { Outlet, useLocation } from "react-router-dom";

import { AuthorityLayout } from "@/authority/AuthorityLayout";

export default function AuthorityRouteLayout() {
  const location = useLocation();

  return (
    <AuthorityLayout sidebarProps={{ activeHref: location.pathname }}>
      <Outlet />
    </AuthorityLayout>
  );
}
