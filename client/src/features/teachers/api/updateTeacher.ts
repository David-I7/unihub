import client from "@/api/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { UpdateTeacherRequest, Teacher } from "./types";
import { teacherKeys } from "./keys";

export async function updateTeacher(
  teacherId: string,
  payload: UpdateTeacherRequest,
): Promise<Teacher> {
  const response = await client.patch<Teacher>(
    `/teachers/${teacherId}`,
    payload,
  );
  return response.data;
}

export function useUpdateTeacher(teacherId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variables: { teacherId?: string; payload: UpdateTeacherRequest } | UpdateTeacherRequest) => {
      const targetId = "teacherId" in variables && variables.teacherId ? variables.teacherId : teacherId;
      if (!targetId) {
        throw new Error("Teacher ID is required for update.");
      }
      const data = "payload" in variables ? variables.payload : variables;
      return updateTeacher(targetId, data);
    },
    onSuccess: (_, variables) => {
      const targetId = "teacherId" in variables && variables.teacherId ? variables.teacherId : teacherId;
      if (targetId) {
        queryClient.invalidateQueries({ queryKey: teacherKeys.detail(targetId) });
      }
      queryClient.invalidateQueries({ queryKey: teacherKeys.lists() });
    },
  });
}
