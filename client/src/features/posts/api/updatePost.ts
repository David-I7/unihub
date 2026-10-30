import client from "@/api/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Post } from "@/types/domain";
import type { PostTarget, UpdatePostPayload } from "./types";
import { postKeys } from "./getCommunityPosts";
import { removeInfiniteQueryPagesExceptFirst } from "@/lib/queryCacheUtils";

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
    mutationFn: (
      variables: { postId: string; target: PostTarget } & UpdatePostVariables,
    ) => {
      return updatePost(variables);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: postKeys.detail(variables.postId),
      });

      if (variables.target.type === "community") {
        removeInfiniteQueryPagesExceptFirst(
          queryClient,
          postKeys.community(variables.target.communitySlug),
        );
        queryClient.invalidateQueries({
          queryKey: postKeys.community(variables.target.communitySlug),
        });
      } else {
        removeInfiniteQueryPagesExceptFirst(
          queryClient,
          postKeys.course(
            variables.target.communitySlug,
            variables.target.studyYearSlug,
            variables.target.courseSlug,
          ),
        );
        queryClient.invalidateQueries({
          queryKey: postKeys.course(
            variables.target.communitySlug,
            variables.target.studyYearSlug,
            variables.target.courseSlug,
          ),
        });
      }
    },
  });
}
