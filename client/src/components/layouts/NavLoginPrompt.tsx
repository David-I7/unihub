import { LogIn, UserPlus, Sun, Moon, Laptop } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useThemeStore } from "@/store/useThemeStore";
import { Link, useNavigate } from "react-router";

export function NavLoginPrompt() {
  const { state, isMobile } = useSidebar();
  const navigate = useNavigate();
  const theme = useThemeStore((state) => state.theme);
  const setTheme = useThemeStore((state) => state.setTheme);

  // When collapsed on desktop, render a compact centered button with tooltip
  if (state === "collapsed" && !isMobile) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton
            tooltip="Sign In / Register"
            render={<Link to="/login" />}
            className="text-primary hover:text-primary hover:bg-primary/10"
          >
            <LogIn className="size-4 sm:size-5" />
            <span>Sign In</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  return (
    <div className="flex flex-col gap-2.5 p-3 rounded-xl bg-sidebar-accent/50 border border-sidebar-border/70">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-sidebar-foreground">
          Welcome to UniHub
        </span>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="ghost"
                size="icon-xs"
                className="text-muted-foreground hover:text-foreground h-6 w-6"
              >
                {theme === "dark" ? (
                  <Moon className="size-3.5" />
                ) : theme === "light" ? (
                  <Sun className="size-3.5" />
                ) : (
                  <Laptop className="size-3.5" />
                )}
              </Button>
            }
          />
          <DropdownMenuContent align="end" className="min-w-32 p-1">
            <DropdownMenuItem onClick={() => setTheme("light")}>
              <Sun className="mr-2 size-3.5" /> Light
              {theme === "light" && (
                <span className="ml-auto text-xs font-bold">✓</span>
              )}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("dark")}>
              <Moon className="mr-2 size-3.5" /> Dark
              {theme === "dark" && (
                <span className="ml-auto text-xs font-bold">✓</span>
              )}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("system")}>
              <Laptop className="mr-2 size-3.5" /> System
              {theme === "system" && (
                <span className="ml-auto text-xs font-bold">✓</span>
              )}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <p className="text-xs text-muted-foreground leading-relaxed">
        Sign in to join communities, shared resources, and rate teachers.
      </p>

      <div className="grid grid-cols-2 gap-2 pt-1">
        <Button
          size="sm"
          className="w-full text-xs font-medium"
          onClick={() => navigate("/login")}
        >
          <LogIn className="mr-1.5 size-3.5" />
          Log In
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="w-full text-xs font-medium"
          onClick={() => navigate("/register")}
        >
          <UserPlus className="mr-1.5 size-3.5" />
          Sign Up
        </Button>
      </div>
    </div>
  );
}
