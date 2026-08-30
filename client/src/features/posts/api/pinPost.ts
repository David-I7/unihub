import client from "@/api/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Post } from "@/types/domain";
import { postKeys } from "./getCommunityPosts";

export interface PinPostVariables {
  postId: string;
  pinned: boolean;
}

export async function pinPost({
  postId,
  pinned,
}: PinPostVariables): Promise<Post> {
  const response = await client.patch<Post>(`/posts/${postId}/pin`, {
    pinned,
  });
  return response.data;
}

export function usePinPost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: pinPost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: postKeys.all });
    },
  });
}
