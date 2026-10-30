import client from "@/api/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { postKeys } from "./getCommunityPosts";
import { commentKeys } from "@/features/comments/api/getPostComments";
import { removeInfiniteQueryPagesExceptFirst } from "@/lib/queryCacheUtils";
import type { PostTarget } from "./types";

export async function deletePost(postId: string): Promise<void> {
  await client.delete(`/posts/${postId}`);
}

export function useDeletePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (variables: { postId: string; target: PostTarget }) => {
      return deletePost(variables.postId);
    },
    onSuccess: (_, variables) => {
      queryClient.removeQueries({
        queryKey: postKeys.detail(variables.postId),
      });
      queryClient.removeQueries({
        queryKey: commentKeys.post(variables.postId),
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
