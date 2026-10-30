import client from "@/api/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Post } from "@/types/domain";
import { postKeys } from "./getCommunityPosts";
import { removeInfiniteQueryPagesExceptFirst } from "@/lib/queryCacheUtils";
import type { PostTarget } from "./types";

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
    mutationFn: (variables: {
      postId: string;
      pinned: boolean;
      target: PostTarget;
    }) => {
      return pinPost(variables);
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
