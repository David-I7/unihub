import client from "@/api/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Comment } from "@/types/domain";
import type { CreateCommentPayload } from "./types";
import { commentKeys } from "./getPostComments";
import { postKeys } from "@/features/posts/api/getCommunityPosts";

export interface CreateCommentVariables {
  postId: string;
  payload: CreateCommentPayload;
}

export async function createComment({
  postId,
  payload,
}: CreateCommentVariables): Promise<Comment> {
  const response = await client.post<Comment>(
    `/posts/${postId}/comments`,
    payload,
  );
  return response.data;
}

export function useCreateComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createComment,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: commentKeys.post(variables.postId),
      });
      queryClient.invalidateQueries({ queryKey: postKeys.all });
    },
  });
}
