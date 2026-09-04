import client from "@/api/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { communityKeys } from "./communityKeys";
import { userKeys } from "@/features/users";

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
      // Must invalidate: members list, gome detail, infinite communities (to get the new member count).
      queryClient.invalidateQueries({ queryKey: userKeys.communities() });
      queryClient.invalidateQueries({
        queryKey: communityKeys.communityInfinities(),
      });
      queryClient.invalidateQueries({
        queryKey: communityKeys.membersList(variables.communitySlug),
      });
      queryClient.invalidateQueries({
        queryKey: communityKeys.homeDetail(variables.communitySlug),
      });
    },
  });
}
