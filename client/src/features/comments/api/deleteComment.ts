import client from "@/api/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Comment, Post, PostDetail } from "@/types/domain";
import { commentKeys } from "./getPostComments";
import { postKeys } from "@/features/posts/api/getCommunityPosts";
import {
  removeInfiniteQueryItem,
  updateInfiniteQueryItem,
  patchDetailQuery,
  rollbackOptimisticContext,
  type OptimisticRollbackContext,
} from "@/lib/queryCacheUtils";

export interface DeleteCommentVariables {
  commentId: string;
  postId?: string;
}

export async function deleteComment(commentId: string): Promise<void> {
  await client.delete(`/comments/${commentId}`);
}

export function useDeleteComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variables: DeleteCommentVariables) =>
      deleteComment(variables.commentId),
    onMutate: async ({
      commentId,
      postId,
    }): Promise<OptimisticRollbackContext> => {
      const commentKey = postId ? commentKeys.post(postId) : commentKeys.all;
      await queryClient.cancelQueries({ queryKey: commentKey });
      if (postId) {
        await queryClient.cancelQueries({ queryKey: postKeys.all });
      }

      const previousQueries = queryClient.getQueriesData({
        queryKey: commentKey,
      });

      let previousDetail: [typeof postKeys.detail extends (...args: any[]) => infer R ? R : never, PostDetail | undefined] | undefined;
      let postFeedQueries: [readonly unknown[], unknown][] = [];

      if (postId) {
        const detailKey = postKeys.detail(postId);
        const detailData = queryClient.getQueryData<PostDetail>(detailKey);
        previousDetail = [detailKey, detailData];
        postFeedQueries = queryClient.getQueriesData({ queryKey: postKeys.all });

        patchDetailQuery<PostDetail>(queryClient, detailKey, (old) => ({
          ...old,
          commentsCount: Math.max(0, (old.commentsCount || 1) - 1),
        }));

        updateInfiniteQueryItem<Post>(queryClient, postKeys.all, postId, (p) => ({
          ...p,
          commentsCount: Math.max(0, (p.commentsCount || 1) - 1),
        }));
      }

      removeInfiniteQueryItem<Comment>(queryClient, commentKey, commentId);

      return {
        previousDetail,
        previousQueries: [...previousQueries, ...postFeedQueries] as any,
      };
    },
    onError: (_err, _vars, context) => {
      rollbackOptimisticContext(queryClient, context);
    },
  });
}
