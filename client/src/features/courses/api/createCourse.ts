import client from "@/api/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Course, CreateCoursePayload } from "./types";
import { studyYearHomeKeys } from "@/features/studyYears/api/getStudyYearHome";
import { studyYearCoursesKeys } from "@/features/studyYears/api/getStudyYearCourses";
import { communityKeys } from "@/features/communities";

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
      queryClient.invalidateQueries({
        queryKey: studyYearHomeKeys.courses(variables.communitySlug, variables.studyYearSlug),
      });
      queryClient.invalidateQueries({
        queryKey: ["study-years", "home", "infinite", variables.communitySlug, variables.studyYearSlug],
      });
      queryClient.invalidateQueries({
        queryKey: studyYearCoursesKeys.courses(variables.communitySlug, variables.studyYearSlug),
      });
      queryClient.invalidateQueries({
        queryKey: communityKeys.homeDetail(variables.communitySlug),
      });
      queryClient.invalidateQueries({
        queryKey: communityKeys.studyYearDetail(variables.communitySlug),
      });
    },
  });
}
