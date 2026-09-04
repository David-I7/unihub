import client from "@/api/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Comment } from "@/types/domain";
import type { UpdateCommentPayload } from "./types";
import { commentKeys } from "./getPostComments";
import {
  updateInfiniteQueryItem,
  rollbackOptimisticContext,
  type OptimisticRollbackContext,
} from "@/lib/queryCacheUtils";

export interface UpdateCommentVariables {
  commentId: string;
  postId?: string;
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
    onMutate: async ({
      commentId,
      postId,
      payload,
    }): Promise<OptimisticRollbackContext> => {
      const targetKey = postId ? commentKeys.post(postId) : commentKeys.all;
      await queryClient.cancelQueries({ queryKey: targetKey });

      const previousQueries = queryClient.getQueriesData({
        queryKey: targetKey,
      });

      updateInfiniteQueryItem<Comment>(queryClient, targetKey, commentId, (c) => ({
        ...c,
        content: payload.content,
        updatedAt: new Date().toISOString(),
      }));

      return {
        previousQueries,
      };
    },
    onSuccess: (updatedComment, variables) => {
      const targetKey = variables.postId
        ? commentKeys.post(variables.postId)
        : commentKeys.all;

      updateInfiniteQueryItem<Comment>(
        queryClient,
        targetKey,
        updatedComment.id,
        (c) => ({
          ...c,
          ...updatedComment,
        }),
      );
    },
    onError: (_err, _vars, context) => {
      rollbackOptimisticContext(queryClient, context);
    },
  });
}
