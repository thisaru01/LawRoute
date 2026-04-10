import {
  BookOpen,
  Briefcase,
  ChevronRight,
  CircleUser,
  FileText,
  LayoutDashboard,
  LogOut,
  Scale,
  Users,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import { setAuthToken } from "@/context/auth/authStorage";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from "@/components/ui/sidebar";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

const defaultItems = [
  { title: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { title: "Profile", href: "/admin/profile", icon: CircleUser },
  {
    title: "Users",
    href: "/admin/users",
    icon: Users,
    children: [
      { title: "Authority", href: "/admin/users/authority" },
      { title: "Lawyer", href: "/admin/users/lawyer" },
    ],
  },
  {
    title: "Cases",
    icon: Briefcase,
    children: [
      { title: "Open", href: "/admin/cases/open" },
      { title: "Closed", href: "/admin/cases/closed" },
    ],
  },
  {
    title: "Civil Issues",
    icon: Scale,
    children: [
      { title: "Pending", href: "/admin/civil-issues/pending" },
      { title: "In Progress", href: "/admin/civil-issues/in_progress" },
      { title: "Resolved", href: "/admin/civil-issues/resolved" },
      { title: "Rejected", href: "/admin/civil-issues/rejected" },
    ],
  },
  {
    title: "Articles",
    icon: BookOpen,
    children: [
      { title: "Create", href: "/admin/articles/create" },
      { title: "Pending", href: "/admin/articles/pending" },
      { title: "Published", href: "/admin/articles/published" },
      { title: "Rejected", href: "/admin/articles/rejected" },
    ],
  },
  { title: "Documents", href: "/admin/documents", icon: FileText },
];

export function AdminSidebar({ items = defaultItems, activeHref }) {
  const currentPath =
    activeHref ??
    (typeof window !== "undefined" ? window.location.pathname : "");

  const navigate = useNavigate();
  const handleLogout = () => {
    setAuthToken(null);
    navigate("/auth", { replace: true });
  };

  return (
    <Sidebar collapsible="icon" variant="sidebar">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild size="lg">
              <Link to="/">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <Scale className="size-4" aria-hidden="true" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">LawRoute</span>
                  <span className="truncate text-xs text-muted-foreground">
                    Admin
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarMenu>
          {items.map((item) => {
            const Icon = item.icon;
            if (item.children?.length) {
              const isGroupActive = item.children.some(
                (child) => child.href === currentPath,
              );
              const shouldOpen =
                isGroupActive ||
                item.children.some((child) =>
                  currentPath.startsWith(child.href),
                );

              return (
                <Collapsible
                  key={item.title}
                  defaultOpen={shouldOpen}
                  className="group/collapsible"
                >
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton
                        isActive={isGroupActive}
                        tooltip={item.title}
                      >
                        <Icon aria-hidden="true" />
                        <span>{item.title}</span>
                        <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>

                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {item.children.map((child) => {
                          const isActive = currentPath === child.href;

                          return (
                            <SidebarMenuSubItem key={child.href}>
                              <SidebarMenuSubButton asChild isActive={isActive}>
                                <Link to={child.href}>
                                  <span>{child.title}</span>
                                </Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          );
                        })}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              );
            }

            const isActive = currentPath === item.href;

            return (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  isActive={isActive}
                  tooltip={item.title}
                >
                  <Link to={item.href}>
                    <Icon aria-hidden="true" />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              tooltip="Logout"
              className="text-destructive hover:bg-destructive/10"
            >
              <button type="button" onClick={handleLogout}>
                <LogOut aria-hidden="true" />
                <span>Logout</span>
              </button>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        <div className="px-2 py-1 text-xs text-muted-foreground group-data-[collapsible=icon]:hidden">
          © {new Date().getFullYear()} LawRoute
        </div>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
