import client from "@/api/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Post, PostDetail } from "@/types/domain";
import { postKeys } from "./getCommunityPosts";
import {
  removeInfiniteQueryItem,
  rollbackOptimisticContext,
  type OptimisticRollbackContext,
} from "@/lib/queryCacheUtils";

export async function deletePost(postId: string): Promise<void> {
  await client.delete(`/posts/${postId}`);
}

export function useDeletePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deletePost,
    onMutate: async (postId: string): Promise<OptimisticRollbackContext> => {
      await queryClient.cancelQueries({ queryKey: postKeys.all });

      const detailKey = postKeys.detail(postId);
      const previousDetail = queryClient.getQueryData<PostDetail>(detailKey);
      const previousQueries = queryClient.getQueriesData({
        queryKey: postKeys.all,
      });

      removeInfiniteQueryItem<Post>(queryClient, postKeys.all, postId);

      return {
        previousDetail: [detailKey, previousDetail],
        previousQueries,
      };
    },
    onSuccess: (_, postId) => {
      queryClient.removeQueries({ queryKey: postKeys.detail(postId) });
    },
    onError: (_err, _vars, context) => {
      rollbackOptimisticContext(queryClient, context);
    },
  });
}
