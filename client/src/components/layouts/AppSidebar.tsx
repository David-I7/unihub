import { GraduationCap, PanelLeft } from "lucide-react";
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
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { NavUser } from "./NavUser";
import { NavLoginPrompt } from "./NavLoginPrompt";
import { useAuthStore } from "@/features/auth";
import { Link, useLocation } from "react-router";
import { navItems } from "./nav";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const user = useAuthStore((state) => state.user);
  const location = useLocation();
  const { state, toggleSidebar } = useSidebar();

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
      {/* Brand Header & Toggle */}
      <SidebarHeader className="min-h-14 justify-center p-3 w-full group-data-[collapsible=icon]:p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            {state === "collapsed" ? (
              <SidebarMenuButton
                size="lg"
                tooltip="Expand Sidebar"
                onClick={toggleSidebar}
                className="cursor-pointer"
              >
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <GraduationCap className="size-4" />
                </div>
              </SidebarMenuButton>
            ) : (
              <div className="flex items-center justify-between gap-2 px-1">
                <Link
                  to="/"
                  className="flex items-center gap-2 font-heading text-left"
                >
                  <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                    <GraduationCap className="size-4" />
                  </div>
                  <span className="truncate font-semibold text-base">
                    UniHub
                  </span>
                </Link>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={toggleSidebar}
                  className="text-muted-foreground hover:text-foreground cursor-pointer"
                  title="Collapse Sidebar"
                >
                  <PanelLeft className="size-4" />
                </Button>
              </div>
            )}
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="px-2 group-data-[collapsible=icon]:px-1">
        {/* Core Academic Section */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
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
