import client from "@/api/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { teacherKeys } from "./keys";
import { courseHomeKeys } from "@/features/courses/api/getCourseHome";
import { studyYearHomeKeys } from "@/features/studyYears/api/getStudyYearHome";
import { removeInfiniteQueryPagesExceptFirst } from "@/lib/queryCacheUtils";

export async function deleteTeacher(teacherId: string): Promise<void> {
  await client.delete(`/teachers/${teacherId}`);
}

export function useDeleteTeacher(communitySlug: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (targetId: string) => {
      const id = targetId;
      if (!id) {
        throw new Error("Teacher ID is required for deletion.");
      }
      return deleteTeacher(id);
    },
    onSuccess: (_, variables) => {
      const id = variables;
      if (id) {
        queryClient.removeQueries({ queryKey: teacherKeys.detail(id) });
      }
      removeInfiniteQueryPagesExceptFirst(
        queryClient,
        teacherKeys.communityList(communitySlug),
      );
      queryClient.invalidateQueries({ queryKey: courseHomeKeys.all });
      queryClient.invalidateQueries({ queryKey: studyYearHomeKeys.all });
    },
  });
}
