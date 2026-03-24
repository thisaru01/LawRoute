import { Outlet, useLocation } from "react-router-dom";

import { LawyerLayout } from "@/lawyer/LawyerLayout";

export default function LawyerRouteLayout() {
  const location = useLocation();

  return (
    <LawyerLayout sidebarProps={{ activeHref: location.pathname }}>
      <Outlet />
    </LawyerLayout>
  );
}
