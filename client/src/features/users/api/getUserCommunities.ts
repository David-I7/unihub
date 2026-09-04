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
  params: Partial<PaginatedRequest> = {},
  options: { enabled?: boolean } = { enabled: true },
) {
  const user = useAuthStore((state) => state.user);
  const { enabled } = options;
  const { page = 0, size = 100 } = params;

  return useQuery({
    queryKey: [...userKeys.communities(), params],
    queryFn: () => getUserCommunities({ page, size }),
    placeholderData: keepPreviousData,
    enabled: enabled && Boolean(user),
  });
}
