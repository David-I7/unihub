import client from "@/api/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AddCommunityMemberDto } from "./types";
import { communityKeys } from "./communityKeys";

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
      // Must invalidate: members list, home detail, infinite communities (to get the new member count).

      queryClient.resetQueries({
        queryKey: communityKeys.communityInfinities(),
      });
      queryClient.resetQueries({
        queryKey: communityKeys.membersList(variables.communitySlug),
      });
      queryClient.invalidateQueries({
        queryKey: communityKeys.homeDetail(variables.communitySlug),
      });
    },
  });
}
