import client from "@/api/client";
import type { CommunityHome } from "./types";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { communityKeys } from "./communityKeys";

export async function getCommunityHome(
  communitySlug: string,
): Promise<CommunityHome> {
  const response = await client.get<CommunityHome>(
    `/communities/${communitySlug}/home`,
  );
  return response.data;
}

export function useCommunityHome(communitySlug: string) {
  return useQuery({
    queryKey: communityKeys.homeDetail(communitySlug),
    queryFn: () => getCommunityHome(communitySlug),
    placeholderData: keepPreviousData,
    enabled: communitySlug.length > 0,
  });
}
