import {
  BookOpen,
  Briefcase,
  ChevronRight,
  CircleUser,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Scale,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import { setAuthToken } from "@/context/auth/authStorage";
import LawRouteLogo from "@/assets/LawRouteLogo.png";

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
  { title: "Dashboard", href: "/lawyer", icon: LayoutDashboard },
  {
    title: "Profile",
    icon: CircleUser,
    children: [
      { title: "Details", href: "/lawyer/profile/details" },
      { title: "Activities", href: "/lawyer/profile/activities" },
    ],
  },
  {
    title: "Consultation Requests",
    icon: MessageSquare,
    children: [
      { title: "Pending", href: "/lawyer/consultation-requests/pending" },
      { title: "Accepted", href: "/lawyer/consultation-requests/accepted" },
      { title: "Rejected", href: "/lawyer/consultation-requests/rejected" },
    ],
  },
  {
    title: "Cases",
    icon: Briefcase,
    children: [
      { title: "Opened", href: "/lawyer/cases/opened" },
      { title: "Closed", href: "/lawyer/cases/closed" },
    ],
  },
  {
    title: "Articles",
    icon: BookOpen,
    children: [
      { title: "Create", href: "/lawyer/articles/create" },
      { title: "Pending", href: "/lawyer/articles/pending" },
      { title: "Published", href: "/lawyer/articles/published" },
      { title: "Rejected", href: "/lawyer/articles/rejected" },
    ],
  },
];

export function LawyerSidebar({ items = defaultItems, activeHref }) {
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
                <div className="flex aspect-square size-10 items-center justify-center overflow-hidden">
                  <img
                    src={LawRouteLogo}
                    alt="LawRoute"
                    className="h-20 w-20 object-contain"
                  />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">LawRoute</span>
                  <span className="truncate text-xs text-muted-foreground">
                    Lawyer
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
