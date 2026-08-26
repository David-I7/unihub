import client from "@/api/client";
import type { StudyYearDetail } from "./types";
import { useQuery, keepPreviousData } from "@tanstack/react-query";

export interface StudyYearDetailOptions {
  includeArchived?: boolean;
}

export async function getStudyYearDetail(
  communitySlug: string,
  studyYearName: string,
  options: StudyYearDetailOptions = {},
): Promise<StudyYearDetail> {
  const { includeArchived = false } = options;
  const response = await client.get<StudyYearDetail>(
    `/communities/${communitySlug}/study-years/${studyYearName}`,
    {
      params: {
        include_archived: includeArchived,
      },
    },
  );
  return response.data;
}

export const studyYearDetailKeys = {
  all: ["study-years", "detail"] as const,
  detail: (
    communitySlug: string,
    studyYearName: string,
    options: StudyYearDetailOptions = {},
  ) =>
    [
      ...studyYearDetailKeys.all,
      communitySlug,
      studyYearName,
      options.includeArchived ?? false,
    ] as const,
};

export function useStudyYearDetail(
  communitySlug: string,
  studyYearName: string,
  options: StudyYearDetailOptions = {},
) {
  return useQuery({
    queryKey: studyYearDetailKeys.detail(
      communitySlug,
      studyYearName,
      options,
    ),
    queryFn: () =>
      getStudyYearDetail(communitySlug, studyYearName, options),
    placeholderData: keepPreviousData,
    enabled: communitySlug.length > 0 && studyYearName.length > 0,
  });
}
