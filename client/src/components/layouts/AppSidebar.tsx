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
      <SidebarHeader className="min-h-14 justify-center p-3 w-full group-data-[collapsible=icon]:p-1.5">
        <SidebarMenu className="group-data-[collapsible=icon]:items-center">
          <SidebarMenuItem className="group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center">
            {state === "collapsed" ? (
              <SidebarMenuButton
                size="lg"
                tooltip="Expand Sidebar"
                onClick={toggleSidebar}
                className="cursor-pointer group-data-[collapsible=icon]:size-9.5! group-data-[collapsible=icon]:p-0! group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:items-center"
              >
                <div className="flex aspect-square size-8.5 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-xs">
                  <GraduationCap className="size-4.5" />
                </div>
              </SidebarMenuButton>
            ) : (
              <div className="flex items-center justify-between gap-2 px-1">
                <Link
                  to="/"
                  className="flex items-center gap-2.5 font-heading text-left"
                >
                  <div className="flex aspect-square size-8.5 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                    <GraduationCap className="size-4.5" />
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

      <SidebarContent className="px-2 group-data-[collapsible=icon]:px-0">
        {/* Core Academic Section */}
        <SidebarGroup className="group-data-[collapsible=icon]:p-1.5">
          <SidebarGroupContent>
            <SidebarMenu className="group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:gap-1">
              {navItems.map((item) => {
                const active = isRouteActive(item.url);
                return (
                  <SidebarMenuItem
                    key={item.title}
                    className="group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center"
                  >
                    <SidebarMenuButton
                      isActive={active}
                      tooltip={item.title}
                      render={<Link to={item.url} />}
                    >
                      <item.icon className="size-4.5 sm:size-5" />
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
      <SidebarFooter className="p-2 group-data-[collapsible=icon]:p-1.5 group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center">
        {user ? <NavUser user={user} /> : <NavLoginPrompt />}
      </SidebarFooter>
    </Sidebar>
  );
}
