import client from "@/api/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Community, UpdateCommunityDto } from "./types";
import { communityKeys } from "./communityKeys";

import { userKeys } from "@/features/users";
import { removeInfiniteQueryPagesExceptFirst } from "@/lib/queryCacheUtils";

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
      if (variables.payload.readme !== undefined) {
        queryClient.setQueryData(
          communityKeys.readmeDetail(variables.communitySlug),
          (_) => ({ readme: variables.payload.readme }),
        );
        return;
      }
      queryClient.invalidateQueries({
        queryKey: communityKeys.homeDetail(variables.communitySlug),
      });
      queryClient.invalidateQueries({
        queryKey: communityKeys.communityInfinities(),
      });
      queryClient.invalidateQueries({
        queryKey: userKeys.communities(),
      });

      if (variables.payload.newOwnerUsername) {
        removeInfiniteQueryPagesExceptFirst(
          queryClient,
          communityKeys.membersList(variables.communitySlug),
        );
        queryClient.invalidateQueries({
          queryKey: communityKeys.communityMembers(variables.communitySlug),
        });
      }
    },
  });
}
