import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

import { AdminSidebar } from "@/admin/components/AdminSidebar";

export function AdminLayout({ children, sidebarProps }) {
  return (
    <SidebarProvider>
      <AdminSidebar {...sidebarProps} />
      <SidebarInset>
        <header className="flex h-14 items-center gap-2 border-b px-4">
          <SidebarTrigger />
          <Separator orientation="vertical" className="h-4" />
          <div className="text-sm font-medium">Admin</div>
        </header>
        <div className="p-6">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
