import client from "@/api/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AddCommunityMemberDto } from "./types";
import { communityKeys } from "./communityKeys";
import { userKeys } from "@/features/users/api/getUserProfile";
import { useAuthStore } from "@/features/auth";

export interface AddCommunityMemberVariables {
  communitySlug: string;
  payload: AddCommunityMemberDto;
}

export async function addCommunityMember({
  communitySlug,
  payload,
}: AddCommunityMemberVariables): Promise<void> {
  await client.post(`/communities/${communitySlug}/members`, payload);
}

export function useAddCommunityMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addCommunityMember,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: communityKeys.communityInfinities(),
      });
      queryClient.invalidateQueries({
        queryKey: communityKeys.membersList(variables.communitySlug),
      });
      queryClient.invalidateQueries({
        queryKey: communityKeys.homeDetail(variables.communitySlug),
      });
      const currentUser = useAuthStore.getState().user;
      if (currentUser?.username === variables.payload.username) {
        queryClient.invalidateQueries({
          queryKey: communityKeys.membershipDetail(variables.communitySlug),
        });
        queryClient.invalidateQueries({
          queryKey: userKeys.communities(),
        });
      }
    },
  });
}
