import client from "@/api/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Comment } from "@/types/domain";
import type { UpdateCommentPayload } from "./types";
import { commentKeys } from "./getPostComments";

export interface UpdateCommentVariables {
  commentId: string;
  postId: string;
  payload: UpdateCommentPayload;
}

export async function updateComment({
  commentId,
  payload,
}: UpdateCommentVariables): Promise<Comment> {
  const response = await client.patch<Comment>(
    `/comments/${commentId}`,
    payload,
  );
  return response.data;
}

export function useUpdateComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateComment,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: commentKeys.post(variables.postId),
      });
    },
  });
}
