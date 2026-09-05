import client from "@/api/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { communityKeys } from "./communityKeys";
import { userKeys } from "@/features/users";

export async function leaveCommunity(communitySlug: string): Promise<void> {
  await client.delete(`/communities/${communitySlug}/leave`);
}

export function useLeaveCommunity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: leaveCommunity,
    onSuccess: (_, communitySlug) => {
      queryClient.invalidateQueries({ queryKey: userKeys.communities() });
      queryClient.invalidateQueries({
        queryKey: communityKeys.membershipDetail(communitySlug),
      });
      queryClient.invalidateQueries({
        queryKey: communityKeys.homeDetail(communitySlug),
      });
      queryClient.invalidateQueries({
        queryKey: communityKeys.membersList(communitySlug),
      });
      queryClient.invalidateQueries({
        queryKey: communityKeys.communityInfinities(),
      });
    },
  });
}
