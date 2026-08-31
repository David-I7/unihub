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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { NavUser } from "./NavUser";
import { NavLoginPrompt } from "./NavLoginPrompt";
import { useAuthStore } from "@/features/auth";
import { useUnreadNotificationCount } from "@/features/notifications";
import { Link, useLocation } from "react-router";
import { navItems, isRouteActive } from "./nav";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const user = useAuthStore((state) => state.user);
  const { data: totalUnread = 0 } = useUnreadNotificationCount();
  const location = useLocation();
  const { state, toggleSidebar } = useSidebar();

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
                const active = isRouteActive(location.pathname, item.url);
                const isNotifications = item.url === "/notifications";

                return (
                  <SidebarMenuItem
                    key={item.title}
                    className="group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center"
                  >
                    <SidebarMenuButton
                      isActive={active}
                      tooltip={
                        isNotifications && totalUnread > 0
                          ? `${item.title} (${totalUnread})`
                          : item.title
                      }
                      render={<Link to={item.url} />}
                    >
                      <div className="relative flex items-center justify-center">
                        <item.icon className="size-4.5 sm:size-5" />
                        {isNotifications && totalUnread > 0 && (
                          <span className="absolute -top-1 -right-1 size-2 rounded-full bg-primary ring-2 ring-sidebar group-data-[collapsible=none]:hidden group-data-[collapsible=offcanvas]:hidden" />
                        )}
                      </div>
                      <span className="truncate">{item.title}</span>
                      {isNotifications && totalUnread > 0 && (
                        <Badge
                          variant="secondary"
                          className="ml-auto bg-primary/15 text-primary border-primary/20 text-[10px] font-bold px-1.5 py-0 h-4.5 min-w-4.5 flex items-center justify-center rounded-full group-data-[collapsible=icon]:hidden"
                        >
                          {totalUnread > 99 ? "99+" : totalUnread}
                        </Badge>
                      )}
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
