import client from "@/api/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Community, CreateCommunityDto } from "./types";
import { communityKeys } from "./getCommunities";
import { userKeys } from "@/features/users/api/getUserProfile";

export async function createCommunity(
  payload: CreateCommunityDto,
): Promise<Community> {
  const response = await client.post<Community>("/communities", payload);
  return response.data;
}

export function useCreateCommunity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCommunity,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: communityKeys.all });
      queryClient.invalidateQueries({ queryKey: userKeys.communities() });
    },
  });
}
