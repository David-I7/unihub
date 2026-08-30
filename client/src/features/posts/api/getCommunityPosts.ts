import client from "@/api/client";
import {
  getPaginatedNextPageParam,
  getPaginatedPrevPageParam,
  type PaginatedResponse,
} from "@/api/types";
import type { Post } from "@/types/domain";
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

export const postKeys = {
  all: ["posts"] as const,
  community: (slug: string) => [...postKeys.all, "community", slug] as const,
  communityInfinite: (slug: string, params: { size?: number }) =>
    [...postKeys.all, "community", slug, "infinite", params] as const,
  course: (
    communitySlug: string,
    studyYearSlug: string,
    courseSlug: string,
  ) =>
    [
      ...postKeys.all,
      "course",
      communitySlug,
      studyYearSlug,
      courseSlug,
    ] as const,
  courseInfinite: (
    communitySlug: string,
    studyYearSlug: string,
    courseSlug: string,
    params: { size?: number },
  ) =>
    [
      ...postKeys.all,
      "course",
      communitySlug,
      studyYearSlug,
      courseSlug,
      "infinite",
      params,
    ] as const,
  detail: (id: string) => [...postKeys.all, "detail", id] as const,
};

export function useInfiniteCommunityPosts(
  communitySlug: string,
  params: { size?: number } = {},
  options?: Omit<
    UseInfiniteQueryOptions<
      PaginatedResponse<Post>,
      Error,
      InfiniteData<PaginatedResponse<Post>>,
      ReturnType<typeof postKeys.communityInfinite>,
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
    queryKey: postKeys.communityInfinite(communitySlug, { size }),
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
