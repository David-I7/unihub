import client from "@/api/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AddCommunityMemberDto } from "./types";
import { memberKeys } from "./getCommunityMembers";
import { communityHomeKeys } from "./getCommunityHome";

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
        queryKey: memberKeys.list(variables.communitySlug),
      });
      queryClient.invalidateQueries({
        queryKey: communityHomeKeys.detail(variables.communitySlug),
      });
    },
  });
}
