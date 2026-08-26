import client from "@/api/client";
import { useAuthStore } from "@/features/auth";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { userKeys } from "./getUserProfile";
import type { UserCommunitiesResponse } from "../types";

export async function getUserCommunities(): Promise<UserCommunitiesResponse> {
  const response = await client.get<UserCommunitiesResponse>(
    "/users/me/communities",
  );
  return response.data;
}

export function useUserCommunities(options: { enabled?: boolean } = {}) {
  const user = useAuthStore((state) => state.user);
  const { enabled = Boolean(user) } = options;

  return useQuery({
    queryKey: userKeys.communities(),
    queryFn: getUserCommunities,
    placeholderData: keepPreviousData,
    enabled: enabled && Boolean(user),
  });
}
