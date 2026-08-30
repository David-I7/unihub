import client from "@/api/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Post } from "@/types/domain";
import type { UpdatePostPayload } from "./types";
import { postKeys } from "./getCommunityPosts";

export interface UpdatePostVariables {
  postId: string;
  payload: UpdatePostPayload;
}

export async function updatePost({
  postId,
  payload,
}: UpdatePostVariables): Promise<Post> {
  const response = await client.patch<Post>(`/posts/${postId}`, payload);
  return response.data;
}

export function useUpdatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updatePost,
    onSuccess: (updatedPost) => {
      queryClient.invalidateQueries({ queryKey: postKeys.all });
      queryClient.setQueryData(postKeys.detail(updatedPost.id), updatedPost);
    },
  });
}
