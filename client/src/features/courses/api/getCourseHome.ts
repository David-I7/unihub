import client from "@/api/client";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import type { CourseHome } from "./types";

export async function getCourseHome(
  communitySlug: string,
  studyYearName: string,
  courseSlug: string,
): Promise<CourseHome> {
  const response = await client.get<CourseHome>(
    `/communities/${communitySlug}/study-years/${studyYearName}/courses/${courseSlug}/home`,
  );
  return response.data;
}

export const courseHomeKeys = {
  all: ["courses", "home"] as const,
  byCourse: (
    communitySlug: string,
    studyYearName: string,
    courseSlug: string,
  ) =>
    [...courseHomeKeys.all, communitySlug, studyYearName, courseSlug] as const,
};

export function useCourseHome(
  communitySlug: string,
  studyYearName: string,
  courseSlug: string,
) {
  return useQuery({
    queryKey: courseHomeKeys.byCourse(communitySlug, studyYearName, courseSlug),
    queryFn: () => getCourseHome(communitySlug, studyYearName, courseSlug),
    placeholderData: keepPreviousData,
    enabled:
      communitySlug.length > 0 &&
      studyYearName.length > 0 &&
      courseSlug.length > 0,
  });
}
