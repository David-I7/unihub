import client from "@/api/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { CreateTeacherRequest, Teacher } from "./types";
import { teacherKeys } from "./keys";

export async function createTeacher(
  communitySlug: string,
  payload: CreateTeacherRequest,
): Promise<Teacher> {
  const response = await client.post<Teacher>(
    `/communities/${communitySlug}/teachers`,
    payload,
  );
  return response.data;
}

export function useCreateTeacher(communitySlug: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateTeacherRequest) =>
      createTeacher(communitySlug, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teacherKeys.lists() });
    },
  });
}
