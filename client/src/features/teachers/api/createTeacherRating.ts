import client from "@/api/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { CreateTeacherRatingRequest, TeacherRating } from "./types";
import { teacherKeys } from "./keys";
import { courseHomeKeys } from "@/features/courses/api/getCourseHome";
import { removeInfiniteQueryPagesExceptFirst } from "@/lib/queryCacheUtils";

export async function createTeacherRating(
  teacherId: string,
  payload: CreateTeacherRatingRequest,
): Promise<TeacherRating> {
  const response = await client.post<TeacherRating>(
    `/teachers/${teacherId}/ratings`,
    payload,
  );
  return response.data;
}

export function useCreateTeacherRating(
  teacherId: string,
  communitySlug: string,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateTeacherRatingRequest) =>
      createTeacherRating(teacherId, payload),
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
