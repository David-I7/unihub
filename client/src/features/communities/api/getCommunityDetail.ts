import client from "@/api/client";
import type { CommunityDetail } from "./types";
import { useQuery, keepPreviousData } from "@tanstack/react-query";

export async function getCommunityDetail(
  communitySlug: string,
): Promise<CommunityDetail> {
  const response = await client.get<CommunityDetail>(
    `/communities/${communitySlug}`,
  );
  return response.data;
}

export const communityDetailKeys = {
  all: ["communities", "detail"] as const,
  detail: (slug: string) => [...communityDetailKeys.all, slug] as const,
};

export function useCommunityDetail(communitySlug: string) {
  return useQuery({
    queryKey: communityDetailKeys.detail(communitySlug),
    queryFn: () => getCommunityDetail(communitySlug),
    placeholderData: keepPreviousData,
    enabled: communitySlug.length > 0,
  });
}
