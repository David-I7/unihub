import client from "@/api/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { CommunityReadmeResponse, UpdateCommunityReadmeDto } from "./types";
import { communityKeys } from "./communityKeys";

export interface UpdateCommunityReadmeVariables {
  communitySlug: string;
  payload: UpdateCommunityReadmeDto;
}

export async function updateCommunityReadme({
  communitySlug,
  payload,
}: UpdateCommunityReadmeVariables): Promise<CommunityReadmeResponse> {
  const response = await client.patch<CommunityReadmeResponse>(
    `/communities/${communitySlug}/readme`,
    payload,
  );
  return response.data;
}

export function useUpdateCommunityReadme() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateCommunityReadme,
    onSuccess: (data, variables) => {
      queryClient.setQueryData(
        communityKeys.readmeDetail(variables.communitySlug),
        data,
      );
      queryClient.invalidateQueries({
        queryKey: communityKeys.readmeDetail(variables.communitySlug),
      });
    },
  });
}