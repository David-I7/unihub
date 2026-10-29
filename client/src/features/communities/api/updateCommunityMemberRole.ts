import client from "@/api/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { CommunityMember, UpdateMemberRoleDto } from "./types";
import { communityKeys } from "./communityKeys";
import { userKeys } from "@/features/users/api/getUserProfile";
import { useAuthStore } from "@/features/auth";
import { removeInfiniteQueryPagesExceptFirst } from "@/lib/queryCacheUtils";

export interface UpdateCommunityMemberRoleVariables {
  communitySlug: string;
  username: string;
  payload: UpdateMemberRoleDto;
}

export async function updateCommunityMemberRole({
  communitySlug,
  username,
  payload,
}: UpdateCommunityMemberRoleVariables): Promise<CommunityMember> {
  const response = await client.patch<CommunityMember>(
    `/communities/${communitySlug}/members/${username}/role`,
    payload,
  );
  return response.data;
}

export function useUpdateCommunityMemberRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateCommunityMemberRole,
    onSuccess: (_, variables) => {
      removeInfiniteQueryPagesExceptFirst(
        queryClient,
        communityKeys.membersList(variables.communitySlug),
      );
      queryClient.invalidateQueries({
        queryKey: communityKeys.communityMembers(variables.communitySlug),
      });
      queryClient.invalidateQueries({
        queryKey: communityKeys.homeDetail(variables.communitySlug),
      });
    },
  });
}
