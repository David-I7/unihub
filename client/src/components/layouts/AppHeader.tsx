import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/features/auth";
import { useLogout } from "@/features/auth/api/logout";
import { useThemeStore } from "@/store/useThemeStore";
import {
  GraduationCap,
  LogIn,
  LogOut,
  Moon,
  Sun,
  Laptop,
  KeyRound,
  User as UserIcon,
} from "lucide-react";
import { Link, useNavigate } from "react-router";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function AppHeader() {
  const user = useAuthStore((state) => state.user);
  const { mutate: logout, status: logoutStatus } = useLogout();
  const theme = useThemeStore((state) => state.theme);
  const setTheme = useThemeStore((state) => state.setTheme);
  const navigate = useNavigate();

  const isLoggingOut = logoutStatus === "pending";
  const initials = user?.username
    ? user.username.slice(0, 2).toUpperCase()
    : user?.email.slice(0, 2).toUpperCase() || "U";

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
            <DropdownMenuContent className="min-w-56 rounded-lg p-2" align="end">
              <DropdownMenuGroup>
                <DropdownMenuLabel className="p-0 font-normal">
                  <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <Avatar className="h-8 w-8 rounded-lg">
                      <AvatarFallback className="rounded-lg bg-primary/15 text-primary font-semibold text-xs">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">
                        {user.username}
                      </span>
                      <span className="truncate text-xs text-muted-foreground">
                        {user.email}
                      </span>
                    </div>
                  </div>
                </DropdownMenuLabel>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={() => navigate("/profile")}>
                  <UserIcon className="mr-2 size-4" />
                  <span>My Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/settings/password")}>
                  <KeyRound className="mr-2 size-4" />
                  <span>Change Password</span>
                </DropdownMenuItem>
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    {theme === "dark" ? (
                      <Moon className="mr-2 size-4" />
                    ) : theme === "light" ? (
                      <Sun className="mr-2 size-4" />
                    ) : (
                      <Laptop className="mr-2 size-4" />
                    )}
                    <span>Theme</span>
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent className="p-1 min-w-32">
                    <DropdownMenuItem onClick={() => setTheme("light")}>
                      <Sun className="mr-2 size-4" />
                      <span>Light</span>
                      {theme === "light" && (
                        <span className="ml-auto text-xs font-bold">✓</span>
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setTheme("dark")}>
                      <Moon className="mr-2 size-4" />
                      <span>Dark</span>
                      {theme === "dark" && (
                        <span className="ml-auto text-xs font-bold">✓</span>
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setTheme("system")}>
                      <Laptop className="mr-2 size-4" />
                      <span>System</span>
                      {theme === "system" && (
                        <span className="ml-auto text-xs font-bold">✓</span>
                      )}
                    </DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                disabled={isLoggingOut}
                onClick={() => logout()}
              >
                <LogOut className="mr-2 size-4" />
                <span>{isLoggingOut ? "Logging out..." : "Log out"}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
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
