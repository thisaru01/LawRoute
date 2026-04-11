import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

import { CitizenSidebar } from "@/citizen/components/CitizenSidebar";
import { useAuth } from "@/context/auth/useAuth";

export function CitizenLayout({ children, sidebarProps }) {
  const { user } = useAuth();
  return (
    <SidebarProvider>
      <CitizenSidebar {...sidebarProps} />
      <SidebarInset>
        <header className="flex h-14 items-center gap-2 border-b px-4">
          <SidebarTrigger />
          <Separator orientation="vertical" className="h-4" />
          <div className="text-sm font-medium">{user?.name ?? "Citizen"}</div>
        </header>
        <div className="p-6">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
