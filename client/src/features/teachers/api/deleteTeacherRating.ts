import client from "@/api/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { teacherKeys } from "./keys";

export async function deleteTeacherRating(
  teacherId: string,
  ratingId: number,
): Promise<void> {
  await client.delete(`/teachers/${teacherId}/ratings/${ratingId}`);
}

export function useDeleteTeacherRating(teacherId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ratingId: number) => deleteTeacherRating(teacherId, ratingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teacherKeys.ratings(teacherId) });
      queryClient.invalidateQueries({ queryKey: teacherKeys.detail(teacherId) });
      queryClient.invalidateQueries({ queryKey: teacherKeys.lists() });
    },
  });
}
