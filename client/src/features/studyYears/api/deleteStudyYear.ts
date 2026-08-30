import client from "@/api/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { communityHomeKeys } from "@/features/communities/api/getCommunityHome";

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
        queryKey: communityHomeKeys.detail(variables.communitySlug),
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
