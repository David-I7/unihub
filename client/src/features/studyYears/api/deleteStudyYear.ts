import client from "@/api/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { communityKeys } from "@/features/communities";

export interface DeleteStudyYearVariables {
  communitySlug: string;
  studyYearName: string;
}

export async function deleteStudyYear({
  communitySlug,
  studyYearName,
}: DeleteStudyYearVariables): Promise<void> {
  await client.delete(
    `/communities/${communitySlug}/study-years/${studyYearName}`,
  );
}

export function useDeleteStudyYear() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteStudyYear,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: communityKeys.homeDetail(variables.communitySlug),
      });
      queryClient.invalidateQueries({
        queryKey: ["communities", variables.communitySlug, "study-years"],
      });
      queryClient.invalidateQueries({
        queryKey: ["study-years", "home"],
      });
    },
  });
}
