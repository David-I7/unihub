import client from "@/api/client";
import type { CommunityStudyYears } from "./types";
import { useQuery, keepPreviousData } from "@tanstack/react-query";

export async function getCommunityDetail(
  communitySlug: string,
): Promise<CommunityStudyYears> {
  const response = await client.get<CommunityStudyYears>(
    `/communities/${communitySlug}/study-years`,
  );
  return response.data;
}

export const communityDetailKeys = {
  all: ["communities"] as const,
  detail: (slug: string) => [...communityDetailKeys.all, slug, "study-years"] as const,
};

export function useCommunityDetail(communitySlug: string) {
  return useQuery({
    queryKey: communityDetailKeys.detail(communitySlug),
    queryFn: () => getCommunityDetail(communitySlug),
    placeholderData: keepPreviousData,
    enabled: communitySlug.length > 0,
  });
}
