import client from "@/api/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { postKeys } from "./getCommunityPosts";

export interface ToggleLikeVariables {
  postId: string;
  isLiked: boolean;
}

export async function togglePostLike({
  postId,
  isLiked,
}: ToggleLikeVariables): Promise<void> {
  if (isLiked) {
    await client.delete(`/posts/${postId}/likes`);
  } else {
    await client.post(`/posts/${postId}/likes`);
  }
}

export function useTogglePostLike() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: togglePostLike,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: postKeys.all });
    },
  });
}
