import client from "@/api/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { UpdateTeacherRequest, Teacher } from "./types";
import { teacherKeys } from "./keys";
import { courseHomeKeys } from "@/features/courses/api/getCourseHome";
import { studyYearHomeKeys } from "@/features/studyYears/api/getStudyYearHome";

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

export function useUpdateTeacher(communitySlug: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variables: {
      teacherId: string;
      payload: UpdateTeacherRequest;
    }) => {
      const targetId = variables.teacherId;
      return updateTeacher(targetId, variables.payload);
    },
    onSuccess: (_, variables) => {
      const id = variables.teacherId;
      queryClient.invalidateQueries({ queryKey: teacherKeys.detail(id) });

      queryClient.invalidateQueries({
        queryKey: teacherKeys.communityList(communitySlug),
      });
      queryClient.invalidateQueries({ queryKey: courseHomeKeys.all });
      queryClient.invalidateQueries({ queryKey: studyYearHomeKeys.all });
    },
  });
}
