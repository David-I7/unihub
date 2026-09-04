import client from "@/api/client";
import type { PostDetail } from "@/types/domain";
import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { postKeys } from "./getCommunityPosts";

export async function getPostById(postId: string): Promise<PostDetail> {
  const response = await client.get<PostDetail>(`/posts/${postId}`);
  return response.data;
}

export function usePost(
  postId: string,
  options?: Omit<
    UseQueryOptions<
      PostDetail,
      Error,
      PostDetail,
      readonly ["posts", "detail", string]
    >,
    "queryKey" | "queryFn"
  >,
) {
  return useQuery({
    queryKey: postKeys.detail(postId),
    queryFn: () => getPostById(postId),
    enabled: Boolean(postId),
    ...options,
  });
}
