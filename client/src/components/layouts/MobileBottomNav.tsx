import { Link, useLocation } from "react-router";
import { cn } from "@/lib/utils";
import { navItems } from "./nav";

export function MobileBottomNav() {
  const location = useLocation();

  const isRouteActive = (url: string) => {
    if (url === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(url);
  };

  return (
    <nav
      aria-label="Mobile Navigation"
      className="fixed bottom-0 left-0 right-0 z-40 flex h-16 items-center justify-around border-t bg-background/95 px-2 backdrop-blur sm:hidden pb-safe"
    >
      {navItems.map((item) => {
        const active = isRouteActive(item.url);
        const Icon = item.icon;

        return (
          <Link
            key={item.title}
            to={item.url}
            className={cn(
              "flex flex-1 flex-col items-center justify-center gap-1 py-1 text-[11px] font-medium transition-colors select-none",
              active
                ? "text-primary font-semibold"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <div
              className={cn(
                "flex h-7 w-12 items-center justify-center rounded-full transition-all",
                active && "bg-primary/10",
              )}
            >
              <Icon
                className={cn(
                  "size-5",
                  active
                    ? "text-primary stroke-[2.25]"
                    : "text-muted-foreground",
                )}
              />
            </div>
            <span>{item.title}</span>
          </Link>
        );
      })}
    </nav>
  );
}
