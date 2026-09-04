import client from "@/api/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { postKeys } from "./getCommunityPosts";
import {
  updateInfiniteQueryItem,
  patchDetailQuery,
  rollbackOptimisticContext,
  type OptimisticRollbackContext,
} from "@/lib/queryCacheUtils";
import type { Post, PostDetail } from "@/types/domain";

export interface ToggleLikeVariables {
  postId: string;
  isLiked: boolean;
}

export async function togglePostLike({
  postId,
  isLiked,
}: ToggleLikeVariables): Promise<void> {
  if (isLiked) {
    await client.delete(`/posts/${postId}/likes`);
  } else {
    await client.post(`/posts/${postId}/likes`);
  }
}

export function useTogglePostLike() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: togglePostLike,
    onMutate: async ({ postId, isLiked }): Promise<OptimisticRollbackContext> => {
      await queryClient.cancelQueries({ queryKey: postKeys.all });

      const detailKey = postKeys.detail(postId);
      const previousDetail = queryClient.getQueryData<PostDetail>(detailKey);
      const previousQueries = queryClient.getQueriesData({
        queryKey: postKeys.all,
      });

      const nextLiked = !isLiked;
      const delta = nextLiked ? 1 : -1;

      patchDetailQuery<PostDetail>(queryClient, detailKey, (old) => ({
        ...old,
        isLiked: nextLiked,
        likesCount: Math.max(0, old.likesCount + delta),
      }));

      updateInfiniteQueryItem<Post>(queryClient, postKeys.all, postId, (post) => ({
        ...post,
        isLiked: nextLiked,
        likesCount: Math.max(0, post.likesCount + delta),
      }));

      return {
        previousDetail: [detailKey, previousDetail],
        previousQueries,
      };
    },
    onError: (_err, _vars, context) => {
      rollbackOptimisticContext(queryClient, context);
    },
  });
}
