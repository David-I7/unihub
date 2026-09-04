import client from "@/api/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Course, UpdateCoursePayload } from "./types";
import { courseHomeKeys } from "./getCourseHome";
import { studyYearHomeKeys } from "@/features/studyYears/api/getStudyYearHome";
import { studyYearCoursesKeys } from "@/features/studyYears/api/getStudyYearCourses";
import { communityKeys } from "@/features/communities";

export interface UpdateCourseVariables {
  communitySlug: string;
  studyYearSlug: string;
  courseSlug: string;
  payload: UpdateCoursePayload;
}

export async function updateCourse({
  communitySlug,
  studyYearSlug,
  courseSlug,
  payload,
}: UpdateCourseVariables): Promise<Course> {
  const response = await client.patch<Course>(
    `/communities/${communitySlug}/study-years/${studyYearSlug}/courses/${courseSlug}`,
    payload,
  );
  return response.data;
}

export function useUpdateCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateCourse,
    onSuccess: (updatedCourse, variables) => {
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
      if (updatedCourse.slug && updatedCourse.slug !== variables.courseSlug) {
        queryClient.invalidateQueries({
          queryKey: courseHomeKeys.byCourse(
            variables.communitySlug,
            variables.studyYearSlug,
            updatedCourse.slug,
          ),
        });
      }
      queryClient.invalidateQueries({
        queryKey: communityKeys.homeDetail(variables.communitySlug),
      });
    },
  });
}
