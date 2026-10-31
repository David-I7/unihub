import client from "@/api/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { courseHomeKeys } from "./getCourseHome";
import { postKeys } from "@/features/posts/api/getCommunityPosts";
import { studyYearHomeKeys } from "@/features/studyYears/api/getStudyYearHome";
import { studyYearCoursesKeys } from "@/features/studyYears/api/getStudyYearCourses";
import { communityKeys } from "@/features/communities";
import { removeInfiniteQueryPagesExceptFirst } from "@/lib/queryCacheUtils";
import { teacherKeys } from "@/features/teachers/api/keys";

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
      queryClient.removeQueries({
        queryKey: courseHomeKeys.byCourse(
          variables.communitySlug,
          variables.studyYearSlug,
          variables.courseSlug,
        ),
      });
      queryClient.removeQueries({
        queryKey: postKeys.course(
          variables.communitySlug,
          variables.studyYearSlug,
          variables.courseSlug,
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
        refetchType: "none",
      });

      queryClient.invalidateQueries({
        queryKey: teacherKeys.details(),
      });
    },
  });
}
