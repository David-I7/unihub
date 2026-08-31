import client from "@/api/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { courseHomeKeys } from "./getCourseHome";
import { studyYearHomeKeys } from "@/features/studyYears/api/getStudyYearHome";
import { studyYearCoursesKeys } from "@/features/studyYears/api/getStudyYearCourses";
import { communityHomeKeys } from "@/features/communities/api/getCommunityHome";

export interface DeleteCourseVariables {
  communitySlug: string;
  studyYearSlug: string;
  courseSlug: string;
}

export async function deleteCourse({
  communitySlug,
  studyYearSlug,
  courseSlug,
}: DeleteCourseVariables): Promise<void> {
  await client.delete(
    `/communities/${communitySlug}/study-years/${studyYearSlug}/courses/${courseSlug}`,
  );
}

export function useDeleteCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteCourse,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: studyYearHomeKeys.all,
      });
      queryClient.invalidateQueries({
        queryKey: studyYearCoursesKeys.all,
      });
      queryClient.invalidateQueries({
        queryKey: courseHomeKeys.all,
      });
      queryClient.invalidateQueries({
        queryKey: communityHomeKeys.detail(variables.communitySlug),
      });
      queryClient.invalidateQueries({
        queryKey: ["communities", variables.communitySlug, "study-years"],
      });
    },
  });
}
