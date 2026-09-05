import client from "@/api/client";
import type { CommunityReadmeResponse } from "./types";
import { useQuery } from "@tanstack/react-query";
import { communityKeys } from "./communityKeys";

export async function getCommunityReadme(
  communitySlug: string,
): Promise<CommunityReadmeResponse> {
  const response = await client.get<CommunityReadmeResponse>(
    `/communities/${communitySlug}/readme`,
  );
  return response.data;
}

export function useCommunityReadme(
  communitySlug: string,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: communityKeys.readmeDetail(communitySlug),
    queryFn: () => getCommunityReadme(communitySlug),
    enabled: (options?.enabled ?? true) && communitySlug.length > 0,
  });
}