import client from "@/api/client";
import type { CourseMaterialsResponse } from "./types";
import { useQuery, keepPreviousData } from "@tanstack/react-query";

export async function getCourseMaterials(
  communitySlug: string,
  studyYearName: string,
  courseSlug: string,
  folderId?: string,
): Promise<CourseMaterialsResponse> {
  const response = await client.get<CourseMaterialsResponse>(
    `/communities/${communitySlug}/study-years/${studyYearName}/courses/${courseSlug}/materials`,
    {
      params: folderId ? { folderId } : undefined,
    },
  );
  return response.data;
}

export const courseMaterialsKeys = {
  all: ["courses", "materials"] as const,
  byCourse: (
    communitySlug: string,
    studyYearName: string,
    courseSlug: string,
    folderId?: string,
  ) =>
    [
      ...courseMaterialsKeys.all,
      communitySlug,
      studyYearName,
      courseSlug,
      folderId || "root",
    ] as const,
};

export function useCourseMaterials(
  communitySlug: string,
  studyYearName: string,
  courseSlug: string,
  folderId?: string,
) {
  return useQuery({
    queryKey: courseMaterialsKeys.byCourse(
      communitySlug,
      studyYearName,
      courseSlug,
      folderId,
    ),
    queryFn: () =>
      getCourseMaterials(communitySlug, studyYearName, courseSlug, folderId),
    placeholderData: keepPreviousData,
    enabled:
      communitySlug.length > 0 &&
      studyYearName.length > 0 &&
      Boolean(courseSlug),
  });
}
