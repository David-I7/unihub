import client from "@/api/client";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import type { CommunityStudyYears } from "./types";
import { communityKeys } from "./communityKeys";

export async function getCommunityStudyYears(
  communitySlug: string,
): Promise<CommunityStudyYears> {
  const response = await client.get<CommunityStudyYears>(
    `/communities/${communitySlug}/study-years`,
  );
  return response.data;
}

export function useCommunityStudyYears(communitySlug: string) {
  return useQuery<CommunityStudyYears>({
    queryKey: communityKeys.studyYearDetail(communitySlug),
    queryFn: () => getCommunityStudyYears(communitySlug),
    placeholderData: keepPreviousData,
    enabled: communitySlug.length > 0,
  });
}
