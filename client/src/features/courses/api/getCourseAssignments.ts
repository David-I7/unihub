import client from "@/api/client";
import type { PaginatedResponse } from "@/api/types";
import type { CourseAssignment } from "./types";
import { useQuery, keepPreviousData } from "@tanstack/react-query";

export interface CourseAssignmentsQueryParams {
  page?: number;
  size?: number;
}

export async function getCourseAssignments(
  communitySlug: string,
  studyYearName: string,
  courseSlug: string,
  params: CourseAssignmentsQueryParams = {},
): Promise<PaginatedResponse<CourseAssignment>> {
  const { page = 0, size = 10 } = params;
  const response = await client.get<PaginatedResponse<CourseAssignment>>(
    `/communities/${communitySlug}/study-years/${studyYearName}/courses/${courseSlug}/assignments`,
    { params: { page, size } },
  );
  return response.data;
}

export const courseAssignmentsKeys = {
  all: ["courses", "assignments"] as const,
  byCourse: (
    communitySlug: string,
    studyYearName: string,
    courseSlug: string,
    params: CourseAssignmentsQueryParams = {},
  ) =>
    [
      ...courseAssignmentsKeys.all,
      communitySlug,
      studyYearName,
      courseSlug,
      params,
    ] as const,
};

export function useCourseAssignments(
  communitySlug: string,
  studyYearName: string,
  courseSlug: string,
  params: CourseAssignmentsQueryParams = {},
) {
  return useQuery({
    queryKey: courseAssignmentsKeys.byCourse(
      communitySlug,
      studyYearName,
      courseSlug,
      params,
    ),
    queryFn: () =>
      getCourseAssignments(communitySlug, studyYearName, courseSlug, params),
    placeholderData: keepPreviousData,
    enabled:
      communitySlug.length > 0 &&
      studyYearName.length > 0 &&
      Boolean(courseSlug),
  });
}
