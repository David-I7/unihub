import client from "@/api/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { teacherKeys } from "./keys";

export async function deleteTeacher(teacherId: string): Promise<void> {
  await client.delete(`/teachers/${teacherId}`);
}

export function useDeleteTeacher(teacherId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (targetId?: string) => {
      const id = targetId || teacherId;
      if (!id) {
        throw new Error("Teacher ID is required for deletion.");
      }
      return deleteTeacher(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teacherKeys.lists() });
    },
  });
}
