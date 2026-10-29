import client from "@/api/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { teacherKeys } from "./keys";
import { removeInfiniteQueryPagesExceptFirst } from "@/lib/queryCacheUtils";
import { courseHomeKeys } from "@/features/courses/api/getCourseHome";

export async function deleteTeacherRating(
  teacherId: string,
  ratingId: number,
): Promise<void> {
  await client.delete(`/teachers/${teacherId}/ratings/${ratingId}`);
}

export function useDeleteTeacherRating(
  teacherId: string,
  communitySlug: string,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ratingId: number) => deleteTeacherRating(teacherId, ratingId),
    onSuccess: () => {
      removeInfiniteQueryPagesExceptFirst(
        queryClient,
        teacherKeys.ratings(teacherId),
      );
      queryClient.invalidateQueries({
        queryKey: teacherKeys.detail(teacherId),
      });

      removeInfiniteQueryPagesExceptFirst(
        queryClient,
        teacherKeys.communityList(communitySlug),
      );
      queryClient.invalidateQueries({
        queryKey: teacherKeys.communityList(communitySlug),
      });
      queryClient.invalidateQueries({ queryKey: courseHomeKeys.all });
    },
  });
}
