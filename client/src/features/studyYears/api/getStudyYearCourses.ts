import client from "@/api/client";
import type { StudyYearCourses } from "./types";
import { useQuery, keepPreviousData } from "@tanstack/react-query";

export async function getStudyYearCourses(
  communitySlug: string,
  studyYearName: string,
): Promise<StudyYearCourses> {
  const response = await client.get<StudyYearCourses>(
    `/communities/${communitySlug}/study-years/${studyYearName}/courses`,
  );
  return response.data;
}

export const studyYearCoursesKeys = {
  all: ["study-years", "courses"] as const,
  courses: (communitySlug: string, studyYearName: string) =>
    [...studyYearCoursesKeys.all, communitySlug, studyYearName] as const,
  byStudyYear: (communitySlug: string, studyYearName: string) =>
    [...studyYearCoursesKeys.all, communitySlug, studyYearName] as const,
};

export function useStudyYearCourses(
  communitySlug: string,
  studyYearName: string,
) {
  return useQuery({
    queryKey: studyYearCoursesKeys.courses(communitySlug, studyYearName),
    queryFn: () => getStudyYearCourses(communitySlug, studyYearName),
    placeholderData: keepPreviousData,
    enabled: communitySlug.length > 0 && studyYearName.length > 0,
  });
}
