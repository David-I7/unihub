import client from "@/api/client";
import type { UserProfile } from "@/types/domain";
import { useQuery } from "@tanstack/react-query";

export async function getProfile(): Promise<UserProfile> {
  const response = await client.get("/auth/profile");
  return response.data;
}

export function useProfile() {
  return useQuery<UserProfile>({
    queryKey: ["profile"],
    queryFn: () => getProfile(),
    enabled: false, // Disable automatic fetching; call manually when needed
    staleTime: Infinity,
  });
}
