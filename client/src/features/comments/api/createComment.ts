import client from "@/api/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Comment, Post, PostDetail } from "@/types/domain";
import type { CreateCommentPayload } from "./types";
import { commentKeys } from "./getPostComments";
import { postKeys } from "@/features/posts/api/getCommunityPosts";
import {
  updateInfiniteQueryItem,
  patchDetailQuery,
  rollbackOptimisticContext,
  type OptimisticRollbackContext,
} from "@/lib/queryCacheUtils";

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
    onMutate: async ({ postId }): Promise<OptimisticRollbackContext> => {
      await queryClient.cancelQueries({ queryKey: postKeys.all });

      const detailKey = postKeys.detail(postId);
      const previousDetail = queryClient.getQueryData<PostDetail>(detailKey);
      const previousQueries = queryClient.getQueriesData({
        queryKey: postKeys.all,
      });

      // Increment commentsCount on detail
      patchDetailQuery<PostDetail>(queryClient, detailKey, (old) => ({
        ...old,
        commentsCount: (old.commentsCount || 0) + 1,
      }));

      // Increment commentsCount on matching posts in feeds
      updateInfiniteQueryItem<Post>(queryClient, postKeys.all, postId, (post) => ({
        ...post,
        commentsCount: (post.commentsCount || 0) + 1,
      }));

      return {
        previousDetail: [detailKey, previousDetail],
        previousQueries,
      };
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: commentKeys.post(variables.postId),
      });
    },
    onError: (_err, _vars, context) => {
      rollbackOptimisticContext(queryClient, context);
    },
  });
}
