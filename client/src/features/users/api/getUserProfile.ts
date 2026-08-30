import client from "@/api/client";
import { useAuthStore } from "@/features/auth";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import type { UserProfileResponse } from "./types";

export const userKeys = {
  all: ["users"] as const,
  me: () => [...userKeys.all, "me"] as const,
  communities: () => [...userKeys.all, "me", "communities"] as const,
};

export async function getUserProfile(): Promise<UserProfileResponse> {
  const response = await client.get<UserProfileResponse>("/users/me");
  return response.data;
}

export function useUserProfile(
  options: { enabled?: boolean } = { enabled: true },
) {
  const user = useAuthStore((state) => state.user);
  const { enabled = true } = options;

  return useQuery({
    queryKey: userKeys.me(),
    queryFn: getUserProfile,
    placeholderData: keepPreviousData,
    enabled: enabled && Boolean(user),
  });
}
