import { GraduationCap, PanelLeft } from "@/components/ui/icons";
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
import { cn } from "@/lib/utils";

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
                const Icon = item.icon;

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
                      className={cn(
                        "transition-colors",
                        active &&
                          "bg-primary/10 text-primary font-semibold data-active:bg-primary/10 data-active:text-primary hover:bg-primary/15 hover:text-primary",
                      )}
                    >
                      <div className="relative flex items-center justify-center">
                        <Icon
                          className={cn(
                            "size-4.5 sm:size-5 transition-all",
                            active
                              ? "text-primary stroke-[2.25]"
                              : "text-sidebar-foreground/80",
                          )}
                        />
                        {isNotifications && totalUnread > 0 && (
                          <span className="absolute -top-0.5 -right-0.5 size-2 rounded-full bg-primary ring-2 ring-sidebar group-data-[collapsible=none]:hidden group-data-[collapsible=offcanvas]:hidden" />
                        )}
                      </div>
                      <span className="truncate group-data-[collapsible=icon]:hidden">
                        {item.title}
                      </span>
                      {isNotifications && totalUnread > 0 && (
                        <Badge
                          variant="verified"
                          size="xs"
                          className="ml-auto font-bold rounded-full group-data-[collapsible=icon]:hidden"
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
