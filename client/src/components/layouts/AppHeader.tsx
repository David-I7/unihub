import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/features/auth";
import { GraduationCap, LogIn } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function AppHeader() {
  const { isMobile } = useSidebar();
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();
  const location = useLocation();

  // Simple title mapper based on pathname
  const getPageTitle = (path: string) => {
    if (path === "/") return "Home";
    if (path.startsWith("/communities")) return "Communities";
    if (path.startsWith("/teachers")) return "Teachers";
    if (path.startsWith("/login")) return "Login";
    if (path.startsWith("/register")) return "Register";
    if (path.startsWith("/profile")) return "My Profile";
    return "UniHub";
  };

  const initials = user?.username
    ? user.username.slice(0, 2).toUpperCase()
    : user?.email.slice(0, 2).toUpperCase() || "U";

  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between gap-2 border-b bg-background/95 px-4 backdrop-blur transition-[width,height] ease-linear">
      <div className="flex items-center gap-2">
        {/* Sidebar Toggle for Desktop/Tablet */}
        {!isMobile && (
          <>
            <SidebarTrigger className="-ml-1 text-muted-foreground hover:text-foreground" />
            <Separator orientation="vertical" className="mr-2 h-8" />
          </>
        )}

        {/* Mobile Brand Logo */}
        {isMobile && (
          <Link
            to="/"
            className="flex items-center gap-2 font-semibold font-heading"
          >
            <div className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <GraduationCap className="size-4" />
            </div>
            <span className="text-base font-bold">UniHub</span>
          </Link>
        )}

        {/* Desktop Page Title */}
        {!isMobile && (
          <h1 className="text-md font-bold text-foreground">
            {getPageTitle(location.pathname)}
          </h1>
        )}
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2">
        {/* Mobile User / Login Quick Action */}
        {isMobile && (
          <div>
            {user ? (
              <button
                type="button"
                onClick={() => navigate("/profile")}
                className="flex items-center cursor-pointer"
              >
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarFallback className="rounded-lg bg-primary/15 text-primary font-semibold text-xs">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </button>
            ) : (
              <Button
                size="xs"
                variant="default"
                onClick={() => navigate("/login")}
                className="text-xs"
              >
                <LogIn className="mr-1 size-3" />
                Login
              </Button>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
