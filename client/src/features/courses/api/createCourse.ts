import client from "@/api/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Course, CreateCoursePayload } from "./types";
import { studyYearHomeKeys } from "@/features/studyYears/api/getStudyYearHome";
import { studyYearCoursesKeys } from "@/features/studyYears/api/getStudyYearCourses";
import { communityKeys } from "@/features/communities";
import { removeInfiniteQueryPagesExceptFirst } from "@/lib/queryCacheUtils";
import { teacherKeys } from "@/features/teachers/api/keys";

export interface CreateCourseVariables {
  communitySlug: string;
  studyYearSlug: string;
  payload: CreateCoursePayload;
}

export async function createCourse({
  communitySlug,
  studyYearSlug,
  payload,
}: CreateCourseVariables): Promise<Course> {
  const response = await client.post<Course>(
    `/communities/${communitySlug}/study-years/${studyYearSlug}/courses`,
    payload,
  );
  return response.data;
}

export function useCreateCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCourse,
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
        queryKey: studyYearCoursesKeys.courses(
          variables.communitySlug,
          variables.studyYearSlug,
        ),
      });
      queryClient.invalidateQueries({
        queryKey: communityKeys.homeDetail(variables.communitySlug),
      });

      removeInfiniteQueryPagesExceptFirst(
        queryClient,
        teacherKeys.communityList(variables.communitySlug),
      );
      queryClient.invalidateQueries({
        queryKey: teacherKeys.communityList(variables.communitySlug),
      });

      variables.payload.teacherIds?.forEach((teacherId) => {
        queryClient.invalidateQueries({
          queryKey: teacherKeys.detail(teacherId),
        });
      });
    },
  });
}
