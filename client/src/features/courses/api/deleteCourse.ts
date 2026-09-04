import client from "@/api/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { courseHomeKeys } from "./getCourseHome";
import { studyYearHomeKeys } from "@/features/studyYears/api/getStudyYearHome";
import { studyYearCoursesKeys } from "@/features/studyYears/api/getStudyYearCourses";
import { communityKeys } from "@/features/communities";

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
        queryKey: studyYearHomeKeys.courses(variables.communitySlug, variables.studyYearSlug),
      });
      queryClient.invalidateQueries({
        queryKey: ["study-years", "home", "infinite", variables.communitySlug, variables.studyYearSlug],
      });
      queryClient.invalidateQueries({
        queryKey: studyYearCoursesKeys.courses(variables.communitySlug, variables.studyYearSlug),
      });
      queryClient.removeQueries({
        queryKey: courseHomeKeys.byCourse(
          variables.communitySlug,
          variables.studyYearSlug,
          variables.courseSlug,
        ),
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
