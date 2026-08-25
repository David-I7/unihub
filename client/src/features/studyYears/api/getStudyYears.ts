import client from "@/api/client";
import type { StudyYearSummary } from "./types";
import { useQuery, keepPreviousData } from "@tanstack/react-query";

export async function getStudyYears(
  communitySlug: string,
): Promise<StudyYearSummary[]> {
  const response = await client.get<StudyYearSummary[]>(
    `/communities/${communitySlug}/study-years`,
  );
  return response.data;
}

export const studyYearsKeys = {
  all: ["study-years"] as const,
  list: (communitySlug: string) =>
    [...studyYearsKeys.all, "list", communitySlug] as const,
};

export function useStudyYears(communitySlug: string) {
  return useQuery({
    queryKey: studyYearsKeys.list(communitySlug),
    queryFn: () => getStudyYears(communitySlug),
    placeholderData: keepPreviousData,
    enabled: communitySlug.length > 0,
  });
}
