import client from "@/api/client";
import type { PaginatedResponse } from "@/api/types";
import type { CourseLecture } from "./types";
import { useQuery, keepPreviousData } from "@tanstack/react-query";

export interface CourseLecturesQueryParams {
  page?: number;
  size?: number;
}

export async function getCourseLectures(
  communitySlug: string,
  studyYearName: string,
  courseSlug: string,
  params: CourseLecturesQueryParams = {},
): Promise<PaginatedResponse<CourseLecture>> {
  const { page = 0, size = 10 } = params;
  const response = await client.get<PaginatedResponse<CourseLecture>>(
    `/communities/${communitySlug}/study-years/${studyYearName}/courses/${courseSlug}/lectures`,
    { params: { page, size } },
  );
  return response.data;
}

export const courseLecturesKeys = {
  all: ["courses", "lectures"] as const,
  byCourse: (
    communitySlug: string,
    studyYearName: string,
    courseSlug: string,
    params: CourseLecturesQueryParams = {},
  ) =>
    [
      ...courseLecturesKeys.all,
      communitySlug,
      studyYearName,
      courseSlug,
      params,
    ] as const,
};

export function useCourseLectures(
  communitySlug: string,
  studyYearName: string,
  courseSlug: string,
  params: CourseLecturesQueryParams = {},
) {
  return useQuery({
    queryKey: courseLecturesKeys.byCourse(
      communitySlug,
      studyYearName,
      courseSlug,
      params,
    ),
    queryFn: () =>
      getCourseLectures(communitySlug, studyYearName, courseSlug, params),
    placeholderData: keepPreviousData,
    enabled:
      communitySlug.length > 0 &&
      studyYearName.length > 0 &&
      Boolean(courseSlug),
  });
}
