import client from "@/api/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Course } from "./types";
import { studyYearHomeKeys } from "@/features/studyYears/api/getStudyYearHome";
import { studyYearCoursesKeys } from "@/features/studyYears/api/getStudyYearCourses";
import { communityKeys } from "@/features/communities";
import { removeInfiniteQueryPagesExceptFirst } from "@/lib/queryCacheUtils";
import { courseHomeKeys } from "./getCourseHome";

export interface ArchiveCourseVariables {
  communitySlug: string;
  studyYearSlug: string;
  courseSlug: string;
  archived: boolean;
}

export async function archiveCourse({
  communitySlug,
  studyYearSlug,
  courseSlug,
  archived,
}: ArchiveCourseVariables): Promise<Course> {
  const response = await client.patch<Course>(
    `/communities/${communitySlug}/study-years/${studyYearSlug}/courses/${courseSlug}/archive`,
    null,
    {
      params: { archived },
    },
  );
  return response.data;
}

export function useArchiveCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: archiveCourse,
    onSuccess: (_, variables) => {
      removeInfiniteQueryPagesExceptFirst(
        queryClient,
        studyYearHomeKeys.byStudyYear(
          variables.communitySlug,
          variables.studyYearSlug,
        ),
      );
      queryClient.invalidateQueries({
        queryKey: studyYearHomeKeys.byStudyYear(
          variables.communitySlug,
          variables.studyYearSlug,
        ),
      });
      queryClient.invalidateQueries({
        queryKey: communityKeys.homeDetail(variables.communitySlug),
      });
      queryClient.invalidateQueries({
        queryKey: studyYearCoursesKeys.courses(
          variables.communitySlug,
          variables.studyYearSlug,
        ),
      });
      queryClient.invalidateQueries({
        queryKey: courseHomeKeys.byCourse(
          variables.communitySlug,
          variables.studyYearSlug,
          variables.courseSlug,
        ),
      });
    },
  });
}
