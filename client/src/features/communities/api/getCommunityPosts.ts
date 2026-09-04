import client from "@/api/client";
import {
  getPaginatedNextPageParam,
  getPaginatedPrevPageParam,
  type PaginatedResponse,
} from "@/api/types";
import type { Post } from "./types";
import {
  useInfiniteQuery,
  type InfiniteData,
  type UseInfiniteQueryOptions,
} from "@tanstack/react-query";
import { communityKeys } from "./communityKeys";

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

export function useInfiniteCommunityPosts(
  communitySlug: string,
  params: { size?: number } = {},
  options?: Omit<
    UseInfiniteQueryOptions<
      PaginatedResponse<Post>,
      Error,
      InfiniteData<PaginatedResponse<Post>>,
      ReturnType<typeof communityKeys.communityPostinfinite>,
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
    queryKey: communityKeys.communityPostinfinite(communitySlug, { size }),
    queryFn: ({ pageParam }) =>
      getCommunityPosts(communitySlug, {
        page: pageParam,
        size,
      }),
    initialPageParam: 0,
    getNextPageParam: getPaginatedNextPageParam,
    getPreviousPageParam: getPaginatedPrevPageParam,
    enabled: communitySlug.length > 0,
    ...options,
  });
}
