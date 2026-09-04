import client from "@/api/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { StudyYear, StudyYearSlug } from "./types";
import { communityKeys } from "@/features/communities";

export interface CreateStudyYearPayload {
  studyYearName: StudyYearSlug;
}

export interface CreateStudyYearVariables {
  communitySlug: string;
  payload: CreateStudyYearPayload;
}

export async function createStudyYear({
  communitySlug,
  payload,
}: CreateStudyYearVariables): Promise<StudyYear> {
  const response = await client.post<StudyYear>(
    `/communities/${communitySlug}/study-years`,
    payload,
  );
  return response.data;
}

export function useCreateStudyYear() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createStudyYear,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: communityKeys.homeDetail(variables.communitySlug),
      });
      queryClient.invalidateQueries({
        queryKey: ["communities", variables.communitySlug, "study-years"],
      });
    },
  });
}
