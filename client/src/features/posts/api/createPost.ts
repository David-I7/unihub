import client from "@/api/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Post } from "@/types/domain";
import type { CreatePostPayload, PostTarget } from "./types";
import { postKeys } from "./getCommunityPosts";

export interface CreatePostVariables {
  target: PostTarget;
  payload: CreatePostPayload;
}

export async function createPost({
  target,
  payload,
}: CreatePostVariables): Promise<Post> {
  const url =
    target.type === "community"
      ? `/communities/${target.communitySlug}/posts`
      : `/communities/${target.communitySlug}/study-years/${target.studyYearSlug}/courses/${target.courseSlug}/posts`;

  const response = await client.post<Post>(url, payload);
  return response.data;
}

export function useCreatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createPost,
    onSuccess: (_, variables) => {
      if (variables.target.type === "community") {
        queryClient.invalidateQueries({
          queryKey: postKeys.community(variables.target.communitySlug),
        });
      } else {
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
