import client from "@/api/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { postKeys } from "./getCommunityPosts";

export async function deletePost(postId: string): Promise<void> {
  await client.delete(`/posts/${postId}`);
}

export function useDeletePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deletePost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: postKeys.all });
    },
  });
}
