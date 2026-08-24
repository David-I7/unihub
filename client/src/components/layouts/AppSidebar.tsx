import { GraduationCap, Users, Home } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { NavUser } from "./NavUser";
import { NavLoginPrompt } from "./NavLoginPrompt";
import { useAuthStore } from "@/features/auth";
import { Link, useLocation } from "react-router";

// Core Academic navigation
const coreNavItems = [
  {
    title: "Home",
    url: "/",
    icon: Home,
  },
  {
    title: "Communities",
    url: "/proto/communities",
    icon: Users,
  },
  {
    title: "Teachers",
    url: "/teachers",
    icon: GraduationCap,
  },
  // {
  //   title: "Calendar & Deadlines",
  //   url: "/calendar",
  //   icon: CalendarDays,
  // },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const user = useAuthStore((state) => state.user);
  const location = useLocation();

  const isRouteActive = (url: string) => {
    if (url === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(url);
  };

  return (
    <Sidebar
      collapsible="icon"
      className="border-r border-sidebar-border"
      {...props}
    >
      {/* Brand Header */}
      <SidebarHeader className="min-h-14 justify-center p-3 w-full group-data-[collapsible=icon]:p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              render={<Link to="/" />}
              tooltip="UniHub Home"
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <GraduationCap className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                <span className="truncate font-semibold text-base font-heading">
                  UniHub
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="px-2 group-data-[collapsible=icon]:px-1">
        {/* Core Academic Section */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {coreNavItems.map((item) => {
                const active = isRouteActive(item.url);
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      isActive={active}
                      tooltip={item.title}
                      render={<Link to={item.url} />}
                    >
                      <item.icon className="size-4" />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer Profile or Login Prompt */}
      <SidebarFooter className="p-2 group-data-[collapsible=icon]:p-1">
        {user ? <NavUser user={user} /> : <NavLoginPrompt />}
      </SidebarFooter>
    </Sidebar>
  );
}
