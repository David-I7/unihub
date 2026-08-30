import client from "@/api/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { UserEnrolledCommunity } from "@/features/users/api/types";
import { userKeys } from "@/features/users/api/getUserProfile";
import { communityKeys } from "./getCommunities";
import { communityHomeKeys } from "./getCommunityHome";

export interface JoinCommunityPayload {
  joinCode: string;
}

export async function joinCommunity(
  payload: JoinCommunityPayload,
): Promise<UserEnrolledCommunity> {
  const response = await client.post<UserEnrolledCommunity>(
    "/communities/join",
    payload,
  );
  return response.data;
}

export function useJoinCommunity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: joinCommunity,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: userKeys.communities() });
      queryClient.invalidateQueries({ queryKey: communityKeys.all });
      if (data?.slug) {
        queryClient.invalidateQueries({
          queryKey: communityHomeKeys.detail(data.slug),
        });
      }
    },
  });
}
