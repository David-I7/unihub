import client from "@/api/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { teacherKeys } from "./keys";
import { courseHomeKeys } from "@/features/courses/api/getCourseHome";
import { studyYearHomeKeys } from "@/features/studyYears/api/getStudyYearHome";

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
    onSuccess: (_, variables) => {
      const id = variables || teacherId;
      if (id) {
        queryClient.removeQueries({ queryKey: teacherKeys.detail(id) });
      }
      queryClient.invalidateQueries({ queryKey: teacherKeys.lists() });
      queryClient.invalidateQueries({ queryKey: courseHomeKeys.all });
      queryClient.invalidateQueries({ queryKey: studyYearHomeKeys.all });
    },
  });
}
