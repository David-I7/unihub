import client from "@/api/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Course } from "./types";
import { courseHomeKeys } from "./getCourseHome";
import { studyYearHomeKeys } from "@/features/studyYears/api/getStudyYearHome";
import { studyYearCoursesKeys } from "@/features/studyYears/api/getStudyYearCourses";
import { communityHomeKeys } from "@/features/communities/api/getCommunityHome";

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
      queryClient.invalidateQueries({
        queryKey: studyYearHomeKeys.all,
      });
      queryClient.invalidateQueries({
        queryKey: studyYearCoursesKeys.all,
      });
      queryClient.invalidateQueries({
        queryKey: courseHomeKeys.byCourse(
          variables.communitySlug,
          variables.studyYearSlug,
          variables.courseSlug,
        ),
      });
      queryClient.invalidateQueries({
        queryKey: communityHomeKeys.detail(variables.communitySlug),
      });
    },
  });
}
