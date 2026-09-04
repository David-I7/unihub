import client from "@/api/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Post, PostDetail } from "@/types/domain";
import type { UpdatePostPayload } from "./types";
import { postKeys } from "./getCommunityPosts";
import {
  updateInfiniteQueryItem,
  patchDetailQuery,
  rollbackOptimisticContext,
  type OptimisticRollbackContext,
} from "@/lib/queryCacheUtils";

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
    onMutate: async ({ postId, payload }): Promise<OptimisticRollbackContext> => {
      await queryClient.cancelQueries({ queryKey: postKeys.all });

      const detailKey = postKeys.detail(postId);
      const previousDetail = queryClient.getQueryData<PostDetail>(detailKey);
      const previousQueries = queryClient.getQueriesData({
        queryKey: postKeys.all,
      });

      patchDetailQuery<PostDetail>(queryClient, detailKey, (old) => ({
        ...old,
        ...payload,
        updatedAt: new Date().toISOString(),
      }));

      updateInfiniteQueryItem<Post>(queryClient, postKeys.all, postId, (post) => ({
        ...post,
        ...payload,
        updatedAt: new Date().toISOString(),
      }));

      return {
        previousDetail: [detailKey, previousDetail],
        previousQueries,
      };
    },
    onSuccess: (updatedPost) => {
      patchDetailQuery<PostDetail>(
        queryClient,
        postKeys.detail(updatedPost.id),
        (old) => ({
          ...old,
          ...updatedPost,
        }),
      );

      updateInfiniteQueryItem<Post>(
        queryClient,
        postKeys.all,
        updatedPost.id,
        (post) => ({
          ...post,
          ...updatedPost,
        }),
      );
    },
    onError: (_err, _vars, context) => {
      rollbackOptimisticContext(queryClient, context);
    },
  });
}
