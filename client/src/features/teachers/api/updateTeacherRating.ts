import client from "@/api/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { UpdateTeacherRatingRequest, TeacherRating } from "./types";
import { teacherKeys } from "./keys";

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

export function useUpdateTeacherRating(teacherId: string, ratingId?: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variables: { ratingId?: number; payload: UpdateTeacherRatingRequest } | UpdateTeacherRatingRequest) => {
      const targetRatingId = "ratingId" in variables && variables.ratingId ? variables.ratingId : ratingId;
      if (targetRatingId === undefined) {
        throw new Error("Rating ID is required for update.");
      }
      const data = "payload" in variables ? variables.payload : variables;
      return updateTeacherRating(teacherId, targetRatingId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teacherKeys.ratings(teacherId) });
      queryClient.invalidateQueries({ queryKey: teacherKeys.detail(teacherId) });
      queryClient.invalidateQueries({ queryKey: teacherKeys.lists() });
    },
  });
}
