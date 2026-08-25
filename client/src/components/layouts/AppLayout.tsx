import { refresh, useAuthStore } from "@/features/auth/";
import queryClient from "@/lib/queryClient";
import { useEffect, useRef } from "react";
import { Outlet } from "react-router";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { AppHeader } from "./AppHeader";
import { MobileBottomNav } from "./MobileBottomNav";

export default function AppLayout() {
  useAppLayout();

  return (
    <SidebarProvider>
      <div className="relative flex min-h-screen w-full bg-background">
        {/* Desktop & Medium Screens Sidebar */}
        <AppSidebar className="hidden sm:flex" />

        {/* Main Content Inset */}
        <SidebarInset className="flex min-h-screen flex-1 flex-col overflow-hidden">
          {/* Mobile-Only Header */}
          <div className="sm:hidden">
            <AppHeader />
          </div>
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 pb-20 sm:pb-6">
            <Outlet />
          </main>
        </SidebarInset>

        {/* Simplified Mobile Bottom Navigation */}
        <MobileBottomNav />
      </div>
    </SidebarProvider>
  );
}

export function useAppLayout() {
  const isFetched = useRef(false);

  useEffect(() => {
    if (isFetched.current) return;
    isFetched.current = true;

    // Load the user data on initial mount
    async function fetchData() {
      try {
        const data = await refresh();
        useAuthStore.getState().setAuth(data.user, data.accessToken);
        queryClient.invalidateQueries({ queryKey: ["profile"] });
      } catch (error) {
        if (import.meta.env.DEV) console.log("Error refreshing user:", error);
      }
    }

    fetchData();
  }, []);

  return null;
}
