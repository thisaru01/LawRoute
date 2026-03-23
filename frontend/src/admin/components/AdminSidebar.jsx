import {
  BookOpen,
  Briefcase,
  FileText,
  LayoutDashboard,
  MessageSquare,
  Scale,
  Users,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";

const defaultItems = [
  { title: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { title: "Users", href: "/admin/users", icon: Users },
  { title: "Cases", href: "/admin/cases", icon: Briefcase },
  { title: "Articles", href: "/admin/articles", icon: BookOpen },
  { title: "Civil Issues", href: "/admin/civil-issues", icon: Scale },
  { title: "Documents", href: "/admin/documents", icon: FileText },
  { title: "Consultations", href: "/admin/consultations", icon: MessageSquare },
];

export function AdminSidebar({ items = defaultItems, activeHref }) {
  const currentPath =
    activeHref ??
    (typeof window !== "undefined" ? window.location.pathname : "");

  return (
    <Sidebar collapsible="icon" variant="sidebar">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild size="lg">
              <a href="/">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <Scale className="size-4" aria-hidden="true" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">LawRoute</span>
                  <span className="truncate text-xs text-muted-foreground">
                    Admin
                  </span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarMenu>
          {items.map((item) => {
            const Icon = item.icon;
            const isActive = currentPath === item.href;

            return (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  isActive={isActive}
                  tooltip={item.title}
                >
                  <a href={item.href}>
                    <Icon aria-hidden="true" />
                    <span>{item.title}</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="group-data-[collapsible=icon]:hidden">
        <div className="px-2 py-1 text-xs text-muted-foreground">
          © {new Date().getFullYear()} LawRoute
        </div>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
