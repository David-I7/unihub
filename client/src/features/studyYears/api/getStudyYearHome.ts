import client from "@/api/client";
import type { StudyYearHome } from "./types";
import { useQuery, keepPreviousData } from "@tanstack/react-query";

export interface StudyYearHomeOptions {
  includeArchived?: boolean;
}

export async function getStudyYearHome(
  communitySlug: string,
  studyYearName: string,
  options: StudyYearHomeOptions = {},
): Promise<StudyYearHome> {
  const { includeArchived = false } = options;
  const response = await client.get<StudyYearHome>(
    `/communities/${communitySlug}/study-years/${studyYearName}/home`,
    {
      params: {
        include_archived: includeArchived,
      },
    },
  );
  return response.data;
}

export const studyYearHomeKeys = {
  all: ["study-years", "home"] as const,
  courses: (
    communitySlug: string,
    studyYearName: string,
    options: StudyYearHomeOptions = {},
  ) =>
    [
      ...studyYearHomeKeys.all,
      communitySlug,
      studyYearName,
      options.includeArchived ?? false,
    ] as const,
};

export function useStudyYearHome(
  communitySlug: string,
  studyYearName: string,
  options: StudyYearHomeOptions = {},
) {
  return useQuery({
    queryKey: studyYearHomeKeys.courses(communitySlug, studyYearName, options),
    queryFn: () => getStudyYearHome(communitySlug, studyYearName, options),
    placeholderData: keepPreviousData,
    enabled: communitySlug.length > 0 && studyYearName.length > 0,
  });
}
