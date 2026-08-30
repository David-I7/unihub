import client from "@/api/client";
import {
  getPaginatedNextPageParam,
  getPaginatedPrevPageParam,
  type PaginatedResponse,
} from "@/api/types";
import type { Comment } from "@/types/domain";
import {
  useInfiniteQuery,
  type InfiniteData,
  type UseInfiniteQueryOptions,
} from "@tanstack/react-query";

export interface PostCommentsQueryParams {
  page?: number;
  size?: number;
}

export async function getPostComments(
  postId: string,
  params: PostCommentsQueryParams = {},
): Promise<PaginatedResponse<Comment>> {
  const { page = 0, size = 20 } = params;
  const response = await client.get<PaginatedResponse<Comment>>(
    `/posts/${postId}/comments`,
    { params: { page, size } },
  );
  return response.data;
}

export const commentKeys = {
  all: ["comments"] as const,
  post: (postId: string) => [...commentKeys.all, "post", postId] as const,
  infinite: (postId: string, params: { size?: number }) =>
    [...commentKeys.all, "post", postId, "infinite", params] as const,
};

export function useInfinitePostComments(
  postId: string,
  params: { size?: number } = {},
  options?: Omit<
    UseInfiniteQueryOptions<
      PaginatedResponse<Comment>,
      Error,
      InfiniteData<PaginatedResponse<Comment>>,
      ReturnType<typeof commentKeys.infinite>,
      number
    >,
    | "queryKey"
    | "queryFn"
    | "initialPageParam"
    | "getNextPageParam"
    | "getPreviousPageParam"
  >,
) {
  const { size = 20 } = params;

  return useInfiniteQuery({
    queryKey: commentKeys.infinite(postId, { size }),
    queryFn: ({ pageParam }) =>
      getPostComments(postId, {
        page: pageParam,
        size,
      }),
    initialPageParam: 0,
    getNextPageParam: getPaginatedNextPageParam,
    getPreviousPageParam: getPaginatedPrevPageParam,
    enabled: postId.length > 0,
    ...options,
  });
}
