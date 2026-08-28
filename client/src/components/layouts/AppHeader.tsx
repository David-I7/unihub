import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/features/auth";
import { GraduationCap, LogIn } from "lucide-react";
import { Link, useNavigate } from "react-router";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserDropdownMenuContent } from "./UserDropdownMenuContent";
import { getInitials } from "@/lib/utils";

export function AppHeader() {
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();
  const initials = getInitials(user?.username || user?.email);

  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between gap-2 border-b bg-background/95 px-4 backdrop-blur">
      {/* Mobile Brand Logo */}
      <Link
        to="/"
        className="flex items-center gap-2 font-semibold font-heading"
      >
        <div className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <GraduationCap className="size-4" />
        </div>
        <span className="text-base font-bold">UniHub</span>
      </Link>

      {/* Right Controls: User Dropdown or Login */}
      <div className="flex items-center gap-2">
        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <button
                  type="button"
                  className="flex items-center cursor-pointer outline-none rounded-lg focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarFallback className="rounded-lg bg-primary/15 text-primary font-semibold text-xs">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                </button>
              }
            />
            <UserDropdownMenuContent user={user} align="end" />
          </DropdownMenu>
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
    </header>
  );
}

