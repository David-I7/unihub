import client from "@/api/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { memberKeys } from "./getCommunityMembers";
import { communityHomeKeys } from "./getCommunityHome";

export interface RemoveCommunityMemberVariables {
  communitySlug: string;
  username: string;
}

export async function removeCommunityMember({
  communitySlug,
  username,
}: RemoveCommunityMemberVariables): Promise<void> {
  await client.delete(`/communities/${communitySlug}/members/${username}`);
}

export function useRemoveCommunityMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: removeCommunityMember,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: memberKeys.list(variables.communitySlug),
      });
      queryClient.invalidateQueries({
        queryKey: communityHomeKeys.detail(variables.communitySlug),
      });
    },
  });
}
