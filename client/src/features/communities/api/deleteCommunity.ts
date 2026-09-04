import client from "@/api/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { communityKeys } from "./communityKeys";
import { userKeys } from "@/features/users/api/getUserProfile";
import { joinCodeKeys } from "./joinCodes";

export async function deleteCommunity(communitySlug: string): Promise<void> {
  await client.delete(`/communities/${communitySlug}`);
}

export function useDeleteCommunity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteCommunity,
    onSuccess: (_res) => {
      queryClient.resetQueries({ queryKey: communityKeys.all });
      queryClient.resetQueries({ queryKey: userKeys.communities() });
      queryClient.resetQueries({ queryKey: joinCodeKeys.all });
    },
  });
}
