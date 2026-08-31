import client from "@/api/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { CreateTeacherRatingRequest, TeacherRating } from "./types";
import { teacherKeys } from "./keys";

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

export function useCreateTeacherRating(teacherId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateTeacherRatingRequest) =>
      createTeacherRating(teacherId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teacherKeys.ratings(teacherId) });
      queryClient.invalidateQueries({ queryKey: teacherKeys.detail(teacherId) });
      queryClient.invalidateQueries({ queryKey: teacherKeys.lists() });
    },
  });
}
