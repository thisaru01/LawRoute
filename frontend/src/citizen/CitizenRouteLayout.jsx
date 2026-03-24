import { Outlet, useLocation } from "react-router-dom";

import { CitizenLayout } from "@/citizen/CitizenLayout";

export default function CitizenRouteLayout() {
  const location = useLocation();

  return (
    <CitizenLayout sidebarProps={{ activeHref: location.pathname }}>
      <Outlet />
    </CitizenLayout>
  );
}
