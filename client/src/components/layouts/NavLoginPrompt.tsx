import { LogIn, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Link, useNavigate } from "react-router";
import { ThemeDropdownMenu } from "./ThemeMenu";

export function NavLoginPrompt() {
  const { state, isMobile } = useSidebar();
  const navigate = useNavigate();

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
        <ThemeDropdownMenu />
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
