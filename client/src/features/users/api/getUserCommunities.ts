import client from "@/api/client";
import { useAuthStore } from "@/features/auth";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { userKeys } from "./getUserProfile";
import type { PaginatedRequest, PaginatedResponse } from "@/api/types";
import type { UserEnrolledCommunity } from "./types";

export async function getUserCommunities(
  params: PaginatedRequest = { page: 0, size: 100 },
): Promise<PaginatedResponse<UserEnrolledCommunity>> {
  const response = await client.get<PaginatedResponse<UserEnrolledCommunity>>(
    "/users/me/communities",
    { params },
  );
  return response.data;
}

export function useUserCommunities(
  params: PaginatedRequest = { page: 0, size: 100 },
  options: { enabled?: boolean } = { enabled: true },
) {
  const user = useAuthStore((state) => state.user);
  const { enabled } = options;

  return useQuery({
    queryKey: [...userKeys.communities(), params],
    queryFn: () => getUserCommunities(params),
    placeholderData: keepPreviousData,
    enabled: enabled && Boolean(user),
  });
}
