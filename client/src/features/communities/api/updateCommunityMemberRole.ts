import client from "@/api/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { CommunityMember, UpdateMemberRoleDto } from "./types";
import { memberKeys } from "./getCommunityMembers";

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
      queryClient.invalidateQueries({
        queryKey: memberKeys.list(variables.communitySlug),
      });
    },
  });
}
