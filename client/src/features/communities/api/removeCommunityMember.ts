import client from "@/api/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { communityKeys } from "./communityKeys";
import { userKeys } from "@/features/users";
import { useAuthStore } from "@/features/auth";
import type { CommunityMember } from "./types";

export interface RemoveCommunityMemberVariables {
  communitySlug: string;
  member: CommunityMember;
}

export async function removeCommunityMember({
  communitySlug,
  member,
}: RemoveCommunityMemberVariables): Promise<void> {
  if (member.userId === null) {
    return client.delete(
      `/communities/${communitySlug}/members/${member.membershipId}`,
    );
  }
  await client.delete(
    `/communities/${communitySlug}/members/${member.username}`,
  );
}

export function useRemoveCommunityMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: removeCommunityMember,
    onSuccess: (_, variables) => {
      const currentUser = useAuthStore.getState().user;
      const isCaller = currentUser?.username === variables.member.username;

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
