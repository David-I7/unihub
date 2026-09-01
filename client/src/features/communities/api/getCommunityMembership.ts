import client from "@/api/client";
import type { CallerMembership } from "./types";
import { useQuery, keepPreviousData } from "@tanstack/react-query";

export async function getCommunityMembership(
  communitySlug: string,
): Promise<CallerMembership> {
  const response = await client.get<CallerMembership>(
    `/communities/${communitySlug}/membership`,
  );
  return response.data;
}

export const communityMembershipKeys = {
  all: ["communities", "membership"] as const,
  detail: (slug: string) => [...communityMembershipKeys.all, slug] as const,
};

export function useCommunityMembership(
  communitySlug: string,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: communityMembershipKeys.detail(communitySlug),
    queryFn: () => getCommunityMembership(communitySlug),
    placeholderData: keepPreviousData,
    enabled: (options?.enabled ?? true) && communitySlug.length > 0,
    staleTime: 1000 * 60 * 5,
  });
}
