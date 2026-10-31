import client from "@/api/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { commentKeys } from "./getPostComments";
import { removeInfiniteQueryPagesExceptFirst } from "@/lib/queryCacheUtils";

export interface DeleteCommentVariables {
  commentId: string;
  postId: string;
}

export async function deleteComment(commentId: string): Promise<void> {
  await client.delete(`/comments/${commentId}`);
}

export function useDeleteComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variables: DeleteCommentVariables) =>
      deleteComment(variables.commentId),
    onSuccess: (_, variables) => {
      removeInfiniteQueryPagesExceptFirst(
        queryClient,
        commentKeys.post(variables.postId),
      );
      queryClient.invalidateQueries({
        queryKey: commentKeys.post(variables.postId),
      });
    },
  });
}
