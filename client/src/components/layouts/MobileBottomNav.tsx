import { Link, useLocation } from "react-router";
import { cn } from "@/lib/utils";
import { useUnreadNotificationCount } from "@/features/notifications";
import { navItems, isRouteActive } from "./nav";

export function MobileBottomNav() {
  const location = useLocation();
  const { data: totalUnread = 0 } = useUnreadNotificationCount();

  return (
    <nav
      aria-label="Mobile Navigation"
      className="fixed bottom-0 left-0 right-0 z-40 flex h-16 items-center justify-around border-t bg-background/95 px-2 backdrop-blur sm:hidden pb-safe"
    >
      {navItems.map((item) => {
        const active = isRouteActive(location.pathname, item.url);
        const isNotifications = item.url === "/notifications";
        const Icon = item.icon;

        return (
          <Link
            key={item.title}
            to={item.url}
            className={cn(
              "flex flex-1 flex-col items-center justify-center gap-1 py-1 text-[11px] font-medium transition-colors select-none",
              active
                ? "text-foreground font-semibold"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <div
              className={cn(
                "relative flex h-7 w-12 items-center justify-center rounded-full transition-all",
                active && "bg-nav-active text-nav-active-foreground",
              )}
            >
              <Icon
                className={cn(
                  "size-5",
                  active
                    ? "text-foreground stroke-[2.25]"
                    : "text-muted-foreground",
                )}
              />
              {isNotifications && totalUnread > 0 && (
                <span className="absolute top-1 right-3 size-2 rounded-full bg-rose-500 ring-2 ring-background dark:bg-rose-600" />
              )}
            </div>
            <span>{item.title}</span>
          </Link>
        );
      })}
    </nav>
  );
}
