import client from "@/api/client";
import type { StudyYearCourses } from "./types";
import { useQuery, keepPreviousData } from "@tanstack/react-query";

export async function getStudyYearCourses(
  communitySlug: string,
  studyYearSlug: string,
): Promise<StudyYearCourses> {
  const response = await client.get<StudyYearCourses>(
    `/communities/${communitySlug}/study-years/${studyYearSlug}/courses`,
  );
  return response.data;
}

export const studyYearCoursesKeys = {
  all: ["study-years", "courses"] as const,
  courses: (communitySlug: string, studyYearSlug: string) =>
    [...studyYearCoursesKeys.all, communitySlug, studyYearSlug] as const,
};

export function useStudyYearCourses(
  communitySlug: string,
  studyYearSlug: string,
) {
  return useQuery({
    queryKey: studyYearCoursesKeys.courses(communitySlug, studyYearSlug),
    queryFn: () => getStudyYearCourses(communitySlug, studyYearSlug),
    placeholderData: keepPreviousData,
    enabled: communitySlug.length > 0 && studyYearSlug.length > 0,
  });
}
