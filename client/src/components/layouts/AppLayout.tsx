import { refresh, useAuthStore } from "@/features/auth/";
import { useEffect, useRef } from "react";
import { Outlet } from "react-router";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { AppHeader } from "./AppHeader";
import { MobileBottomNav } from "./MobileBottomNav";
import { Toaster } from "@/components/ui/sonner";

export default function AppLayout() {
  useAppLayout();
  const initialized = useAuthStore((state) => state.initialized);

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
          <main className="flex-1 flex flex-col overflow-y-auto p-4 sm:p-6 pb-20 sm:pb-6">
            {!initialized ? (
              <div className="flex-1 w-full max-w-7xl mx-auto space-y-6 animate-pulse">
                <div className="h-44 rounded-2xl bg-muted/60" />
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="h-32 rounded-2xl bg-muted/40" />
                  <div className="h-32 rounded-2xl bg-muted/40" />
                  <div className="h-32 rounded-2xl bg-muted/40" />
                </div>
                <div className="h-64 rounded-2xl bg-muted/30" />
              </div>
            ) : (
              <Outlet />
            )}
          </main>
        </SidebarInset>

        {/* Simplified Mobile Bottom Navigation */}
        <MobileBottomNav />
        <Toaster />
      </div>
    </SidebarProvider>
  );
}

export function useAppLayout() {
  const isFetched = useRef(false);
  const setInitialized = useAuthStore((state) => state.setInitialized);

  useEffect(() => {
    if (isFetched.current) return;
    isFetched.current = true;

    // Load the user data on initial mount
    async function fetchData() {
      try {
        const data = await refresh();
        useAuthStore.getState().setAuth(data.user, data.accessToken);
      } catch (error) {
        if (import.meta.env.DEV) console.log("Error refreshing user:", error);
      } finally {
        setInitialized();
      }
    }

    fetchData();
  }, []);

  return null;
}
