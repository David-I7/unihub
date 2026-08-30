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
import { postKeys } from "./getCommunityPosts";

export interface CoursePostsQueryParams {
  page?: number;
  size?: number;
}

export async function getCoursePosts(
  communitySlug: string,
  studyYearSlug: string,
  courseSlug: string,
  params: CoursePostsQueryParams = {},
): Promise<PaginatedResponse<Post>> {
  const { page = 0, size = 10 } = params;
  const response = await client.get<PaginatedResponse<Post>>(
    `/communities/${communitySlug}/study-years/${studyYearSlug}/courses/${courseSlug}/posts`,
    { params: { page, size } },
  );
  return response.data;
}

export function useInfiniteCoursePosts(
  communitySlug: string,
  studyYearSlug: string,
  courseSlug: string,
  params: { size?: number } = {},
  options?: Omit<
    UseInfiniteQueryOptions<
      PaginatedResponse<Post>,
      Error,
      InfiniteData<PaginatedResponse<Post>>,
      ReturnType<typeof postKeys.courseInfinite>,
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
    queryKey: postKeys.courseInfinite(communitySlug, studyYearSlug, courseSlug, {
      size,
    }),
    queryFn: ({ pageParam }) =>
      getCoursePosts(communitySlug, studyYearSlug, courseSlug, {
        page: pageParam,
        size,
      }),
    initialPageParam: 0,
    getNextPageParam: getPaginatedNextPageParam,
    getPreviousPageParam: getPaginatedPrevPageParam,
    enabled:
      communitySlug.length > 0 &&
      studyYearSlug.length > 0 &&
      courseSlug.length > 0,
    ...options,
  });
}
