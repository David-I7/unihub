import client from "@/api/client";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import type { CommunityStudyYears } from "./types";

export async function getCommunityStudyYears(
  communitySlug: string,
): Promise<CommunityStudyYears> {
  const response = await client.get<CommunityStudyYears>(
    `/communities/${communitySlug}/study-years`,
  );
  return response.data;
}

export const communityStudyYearsKeys = {
  all: ["communities", "study-years"] as const,
  detail: (slug: string) => [...communityStudyYearsKeys.all, slug] as const,
};

export function useCommunityStudyYears(communitySlug: string) {
  return useQuery<CommunityStudyYears>({
    queryKey: communityStudyYearsKeys.detail(communitySlug),
    queryFn: () => getCommunityStudyYears(communitySlug),
    placeholderData: keepPreviousData,
    enabled: communitySlug.length > 0,
  });
}
