import { refresh, useAuthStore } from "@/features/auth/";
import queryClient from "@/lib/queryClient";
import { useEffect, useRef } from "react";
import { Outlet } from "react-router";

export default function AppLayout() {
  useAppLayout();

  return (
    <main>
      <Outlet />
    </main>
  );
}

export function useAppLayout() {
  const isFetched = useRef(false);

  useEffect(() => {
    if (isFetched.current) return;
    isFetched.current = true;
    if (import.meta.env.DEV)
      console.log("AppLayout mounted, fetching user data...");

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
