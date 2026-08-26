import client from "@/api/client";
import type { PaginatedResponse } from "@/api/types";
import type { Post } from "./types";
import {
  useInfiniteQuery,
  type InfiniteData,
  type UseInfiniteQueryOptions,
} from "@tanstack/react-query";

export interface CommunityPostsQueryParams {
  page?: number;
  size?: number;
}

export async function getCommunityPosts(
  communitySlug: string,
  params: CommunityPostsQueryParams = {},
): Promise<PaginatedResponse<Post>> {
  const { page = 0, size = 10 } = params;
  const response = await client.get<PaginatedResponse<Post>>(
    `/communities/${communitySlug}/posts`,
    { params: { page, size } },
  );
  return response.data;
}

export const communityPostKeys = {
  all: ["communities", "posts"] as const,
  list: (slug: string, params: CommunityPostsQueryParams) =>
    [...communityPostKeys.all, slug, "list", params] as const,
  infinite: (slug: string, params: { size?: number }) =>
    [...communityPostKeys.all, slug, "infinite", params] as const,
};

export function useInfiniteCommunityPosts(
  communitySlug: string,
  params: { size?: number } = {},
  options?: Omit<
    UseInfiniteQueryOptions<
      PaginatedResponse<Post>,
      Error,
      InfiniteData<PaginatedResponse<Post>>,
      ReturnType<typeof communityPostKeys.infinite>,
      number
    >,
    | "queryKey"
    | "queryFn"
    | "initialPageParam"
    | "getNextPageParam"
    | "getPreviousPageParam"
  >,
) {
  const { size = 10 } = params;

  return useInfiniteQuery({
    queryKey: communityPostKeys.infinite(communitySlug, { size }),
    queryFn: ({ pageParam }) =>
      getCommunityPosts(communitySlug, {
        page: pageParam,
        size,
      }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) =>
      lastPage.last ? undefined : lastPage.number + 1,
    getPreviousPageParam: (firstPage) =>
      firstPage.first ? undefined : firstPage.number - 1,
    enabled: communitySlug.length > 0,
    ...options,
  });
}
