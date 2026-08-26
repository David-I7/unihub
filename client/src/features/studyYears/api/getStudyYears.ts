import client from "@/api/client";
import type { StudyYear } from "./types";
import { useQuery, keepPreviousData } from "@tanstack/react-query";

export async function getStudyYears(
  communitySlug: string,
): Promise<StudyYear[]> {
  const response = await client.get<{ studyYears?: StudyYear[] } | StudyYear[]>(
    `/communities/${communitySlug}/study-years`,
  );
  if (Array.isArray(response.data)) {
    return response.data;
  }
  return response.data.studyYears ?? [];
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
