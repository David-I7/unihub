import client from "@/api/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Course, CourseHome } from "./types";
import { courseHomeKeys } from "./getCourseHome";
import { studyYearHomeKeys } from "@/features/studyYears/api/getStudyYearHome";
import { studyYearCoursesKeys } from "@/features/studyYears/api/getStudyYearCourses";
import { communityKeys } from "@/features/communities";

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
    onMutate: async ({ communitySlug, studyYearSlug, courseSlug, archived }) => {
      const courseKey = courseHomeKeys.byCourse(
        communitySlug,
        studyYearSlug,
        courseSlug,
      );
      await queryClient.cancelQueries({ queryKey: courseKey });
      const previousCourseHome = queryClient.getQueryData<CourseHome>(courseKey);

      if (previousCourseHome) {
        queryClient.setQueryData<CourseHome>(courseKey, {
          ...previousCourseHome,
          course: {
            ...previousCourseHome.course,
            archived,
          },
        });
      }

      return { previousCourseHome, courseKey };
    },
    onError: (_err, _vars, context) => {
      if (context?.courseKey && context.previousCourseHome) {
        queryClient.setQueryData(context.courseKey, context.previousCourseHome);
      }
    },
    onSuccess: (updatedCourse, variables) => {
      queryClient.setQueryData<CourseHome>(
        courseHomeKeys.byCourse(
          variables.communitySlug,
          variables.studyYearSlug,
          variables.courseSlug,
        ),
        (old) => (old ? { ...old, course: updatedCourse } : old),
      );
      queryClient.invalidateQueries({
        queryKey: studyYearHomeKeys.byStudyYear(
          variables.communitySlug,
          variables.studyYearSlug,
        ),
      });
      queryClient.invalidateQueries({
        queryKey: studyYearCoursesKeys.byStudyYear(
          variables.communitySlug,
          variables.studyYearSlug,
        ),
      });
      queryClient.invalidateQueries({
        queryKey: communityKeys.homeDetail(variables.communitySlug),
      });
    },
  });
}
