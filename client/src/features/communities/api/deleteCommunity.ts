import client from "@/api/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { communityKeys } from "./getCommunities";
import { userKeys } from "@/features/users/api/getUserProfile";

export async function deleteCommunity(communitySlug: string): Promise<void> {
  await client.delete(`/communities/${communitySlug}`);
}

export function useDeleteCommunity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteCommunity,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: communityKeys.all });
      queryClient.invalidateQueries({ queryKey: userKeys.communities() });
    },
  });
}
