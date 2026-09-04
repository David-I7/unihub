import client from "@/api/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Community, UpdateCommunityDto } from "./types";
import { communityKeys } from "./communityKeys";
import { userKeys } from "@/features/users/api/getUserProfile";

export interface UpdateCommunityVariables {
  communitySlug: string;
  payload: UpdateCommunityDto;
}

export async function updateCommunity({
  communitySlug,
  payload,
}: UpdateCommunityVariables): Promise<Community> {
  const response = await client.patch<Community>(
    `/communities/${communitySlug}`,
    payload,
  );
  return response.data;
}

export function useUpdateCommunity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateCommunity,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: communityKeys.all });
    },
  });
}
