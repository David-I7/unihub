import client from "@/api/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { communityKeys } from "./communityKeys";
import { userKeys } from "@/features/users";
import { useAuthStore } from "@/features/auth";

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
      const currentUser = useAuthStore.getState().user;
      const isCaller = currentUser?.username === variables.username;

      if (isCaller) {
        queryClient.invalidateQueries({ queryKey: userKeys.communities() });
        queryClient.invalidateQueries({
          queryKey: communityKeys.membershipDetail(variables.communitySlug),
        });
      }

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
