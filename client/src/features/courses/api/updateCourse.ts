import client from "@/api/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Course, UpdateCoursePayload } from "./types";
import { courseHomeKeys } from "./getCourseHome";
import { studyYearHomeKeys } from "@/features/studyYears/api/getStudyYearHome";
import { studyYearCoursesKeys } from "@/features/studyYears/api/getStudyYearCourses";
import { communityKeys } from "@/features/communities";
import { removeInfiniteQueryPagesExceptFirst } from "@/lib/queryCacheUtils";
import { teacherKeys } from "@/features/teachers/api/keys";

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
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: studyYearHomeKeys.byStudyYear(
          variables.communitySlug,
          variables.studyYearSlug,
        ),
      });
      queryClient.invalidateQueries({
        queryKey: studyYearCoursesKeys.courses(
          variables.communitySlug,
          variables.studyYearSlug,
        ),
      });
      if (variables.payload.slug) {
        queryClient.removeQueries({
          queryKey: courseHomeKeys.byCourse(
            variables.communitySlug,
            variables.studyYearSlug,
            variables.payload.slug,
          ),
        });
      } else {
        queryClient.invalidateQueries({
          queryKey: courseHomeKeys.byCourse(
            variables.communitySlug,
            variables.studyYearSlug,
            variables.courseSlug,
          ),
        });
      }
      if (variables.payload.creditPoints) {
        queryClient.invalidateQueries({
          queryKey: communityKeys.homeDetail(variables.communitySlug),
        });
      }

      if (variables.payload.teacherIds) {
        removeInfiniteQueryPagesExceptFirst(
          queryClient,
          teacherKeys.communityList(variables.communitySlug),
        );
        queryClient.invalidateQueries({
          queryKey: teacherKeys.communityList(variables.communitySlug),
          refetchType: "none",
        });

        variables.payload.teacherIds.forEach((teacherId) => {
          queryClient.invalidateQueries({
            queryKey: teacherKeys.detail(teacherId),
          });
        });
      }
    },
  });
}
