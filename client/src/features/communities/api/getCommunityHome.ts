import client from "@/api/client";
import type { CommunityHome } from "./types";
import { useQuery, keepPreviousData } from "@tanstack/react-query";

export async function getCommunityHome(
  communitySlug: string,
): Promise<CommunityHome> {
  const response = await client.get<CommunityHome>(
    `/communities/${communitySlug}/home`,
  );
  return response.data;
}

export const communityHomeKeys = {
  all: ["communities", "home"] as const,
  detail: (slug: string) => [...communityHomeKeys.all, slug] as const,
};

export function useCommunityHome(communitySlug: string) {
  return useQuery({
    queryKey: communityHomeKeys.detail(communitySlug),
    queryFn: () => getCommunityHome(communitySlug),
    placeholderData: keepPreviousData,
    enabled: communitySlug.length > 0,
  });
}
