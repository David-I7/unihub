import client from "@/api/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Post, PostDetail } from "@/types/domain";
import { postKeys } from "./getCommunityPosts";
import {
  updateInfiniteQueryItem,
  patchDetailQuery,
  rollbackOptimisticContext,
  type OptimisticRollbackContext,
} from "@/lib/queryCacheUtils";

export interface PinPostVariables {
  postId: string;
  pinned: boolean;
}

export async function pinPost({
  postId,
  pinned,
}: PinPostVariables): Promise<Post> {
  const response = await client.patch<Post>(`/posts/${postId}/pin`, {
    pinned,
  });
  return response.data;
}

export function usePinPost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: pinPost,
    onMutate: async ({ postId, pinned }): Promise<OptimisticRollbackContext> => {
      await queryClient.cancelQueries({ queryKey: postKeys.all });

      const detailKey = postKeys.detail(postId);
      const previousDetail = queryClient.getQueryData<PostDetail>(detailKey);
      const previousQueries = queryClient.getQueriesData({
        queryKey: postKeys.all,
      });

      patchDetailQuery<PostDetail>(queryClient, detailKey, (old) => ({
        ...old,
        pinned,
      }));

      updateInfiniteQueryItem<Post>(queryClient, postKeys.all, postId, (post) => ({
        ...post,
        pinned,
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
