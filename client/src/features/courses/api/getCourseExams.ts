import client from "@/api/client";
import type { PaginatedResponse } from "@/api/types";
import type { CourseExam } from "./types";
import { useQuery, keepPreviousData } from "@tanstack/react-query";

export interface CourseExamsQueryParams {
  page?: number;
  size?: number;
}

export async function getCourseExams(
  communitySlug: string,
  studyYearName: string,
  courseId: number | string,
  params: CourseExamsQueryParams = {},
): Promise<PaginatedResponse<CourseExam>> {
  const { page = 0, size = 10 } = params;
  const response = await client.get<PaginatedResponse<CourseExam>>(
    `/communities/${communitySlug}/study-years/${studyYearName}/courses/${courseId}/exams`,
    { params: { page, size } },
  );
  return response.data;
}

export const courseExamsKeys = {
  all: ["courses", "exams"] as const,
  byCourse: (
    communitySlug: string,
    studyYearName: string,
    courseId: number | string,
    params: CourseExamsQueryParams = {},
  ) =>
    [
      ...courseExamsKeys.all,
      communitySlug,
      studyYearName,
      String(courseId),
      params,
    ] as const,
};

export function useCourseExams(
  communitySlug: string,
  studyYearName: string,
  courseId: number | string,
  params: CourseExamsQueryParams = {},
) {
  return useQuery({
    queryKey: courseExamsKeys.byCourse(
      communitySlug,
      studyYearName,
      courseId,
      params,
    ),
    queryFn: () =>
      getCourseExams(communitySlug, studyYearName, courseId, params),
    placeholderData: keepPreviousData,
    enabled:
      communitySlug.length > 0 &&
      studyYearName.length > 0 &&
      Boolean(courseId),
  });
}
