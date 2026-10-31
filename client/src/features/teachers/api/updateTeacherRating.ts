import client from "@/api/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { UpdateTeacherRatingRequest, TeacherRating } from "./types";
import { teacherKeys } from "./keys";
import { removeInfiniteQueryPagesExceptFirst } from "@/lib/queryCacheUtils";
import { courseHomeKeys } from "@/features/courses/api/getCourseHome";

export async function updateTeacherRating(
  teacherId: string,
  ratingId: number,
  payload: UpdateTeacherRatingRequest,
): Promise<TeacherRating> {
  const response = await client.put<TeacherRating>(
    `/teachers/${teacherId}/ratings/${ratingId}`,
    payload,
  );
  return response.data;
}

export function useUpdateTeacherRating(
  teacherId: string,
  communitySlug: string,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variables: {
      ratingId: number;
      payload: UpdateTeacherRatingRequest;
    }) => {
      return updateTeacherRating(
        teacherId,
        variables.ratingId,
        variables.payload,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: teacherKeys.ratings(teacherId),
      });
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
