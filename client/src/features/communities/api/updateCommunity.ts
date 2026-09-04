import client from "@/api/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Community, UpdateCommunityDto } from "./types";
import { communityKeys } from "./communityKeys";

import { userKeys } from "@/features/users";

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
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: communityKeys.homeDetail(variables.communitySlug),
      });
      if (data.slug && data.slug !== variables.communitySlug) {
        queryClient.invalidateQueries({
          queryKey: communityKeys.homeDetail(data.slug),
        });
      }
      queryClient.invalidateQueries({
        queryKey: communityKeys.communityInfinities(),
      });
      queryClient.invalidateQueries({
        queryKey: userKeys.communities(),
      });
    },
  });
}
