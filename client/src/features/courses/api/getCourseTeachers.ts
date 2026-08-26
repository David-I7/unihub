import client from "@/api/client";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import type { CourseTeachers } from "./types";

export async function getCourseTeachers(
  communitySlug: string,
  studyYearName: string,
  courseSlug: string,
): Promise<CourseTeachers> {
  const response = await client.get<CourseTeachers>(
    `/communities/${communitySlug}/study-years/${studyYearName}/courses/${courseSlug}/teachers`,
  );
  return response.data;
}

export const courseTeachersKeys = {
  all: ["courses", "teachers"] as const,
  byCourse: (
    communitySlug: string,
    studyYearName: string,
    courseSlug: string,
  ) =>
    [
      ...courseTeachersKeys.all,
      communitySlug,
      studyYearName,
      courseSlug,
    ] as const,
};

export function useCourseTeachers(
  communitySlug: string,
  studyYearName: string,
  courseSlug: string,
) {
  return useQuery({
    queryKey: courseTeachersKeys.byCourse(
      communitySlug,
      studyYearName,
      courseSlug,
    ),
    queryFn: () => getCourseTeachers(communitySlug, studyYearName, courseSlug),
    placeholderData: keepPreviousData,
    enabled:
      communitySlug.length > 0 &&
      studyYearName.length > 0 &&
      courseSlug.length > 0,
  });
}
