import client from "@/api/client";
import {
  getPaginatedNextPageParam,
  getPaginatedPrevPageParam,
  type PaginatedResponse,
} from "@/api/types";
import type { TeacherDetail, TeacherRating } from "./types";
import { teacherKeys } from "./keys";
import {
  useInfiniteQuery,
  useQuery,
  keepPreviousData,
  type InfiniteData,
  type UseInfiniteQueryOptions,
  type UseQueryOptions,
} from "@tanstack/react-query";

export interface TeacherRatingsQueryParams {
  page?: number;
  size?: number;
  sort?: string;
}

export async function getTeacherDetail(
  teacherId: string,
): Promise<TeacherDetail> {
  const response = await client.get<TeacherDetail>(`/teachers/${teacherId}`);
  return response.data;
}

export async function getTeacherRatings(
  teacherId: string,
  params: TeacherRatingsQueryParams = {},
): Promise<PaginatedResponse<TeacherRating>> {
  const { page = 0, size = 10, sort = "createdAt,desc" } = params;
  const response = await client.get<PaginatedResponse<TeacherRating>>(
    `/teachers/${teacherId}/ratings`,
    {
      params: { page, size, sort },
    },
  );
  return response.data;
}

export function useTeacherDetail(
  teacherId: string | null | undefined,
  options?: Omit<UseQueryOptions<TeacherDetail>, "queryKey" | "queryFn">,
) {
  return useQuery({
    queryKey: teacherId ? teacherKeys.detail(teacherId) : teacherKeys.detail(""),
    queryFn: () => getTeacherDetail(teacherId!),
    placeholderData: keepPreviousData,
    enabled: Boolean(teacherId && teacherId.trim().length > 0),
    ...options,
  });
}

export function useInfiniteTeacherRatings(
  teacherId: string | null | undefined,
  params: { size?: number; sort?: string } = {},
  options?: Omit<
    UseInfiniteQueryOptions<
      PaginatedResponse<TeacherRating>,
      Error,
      InfiniteData<PaginatedResponse<TeacherRating>>,
      ReturnType<typeof teacherKeys.ratings>,
      number
    >,
    | "queryKey"
    | "queryFn"
    | "initialPageParam"
    | "getNextPageParam"
    | "getPreviousPageParam"
  >,
) {
  const { size = 10, sort = "createdAt,desc" } = params;
  const validId = teacherId || "";

  return useInfiniteQuery({
    queryKey: teacherKeys.ratings(validId),
    queryFn: ({ pageParam }) =>
      getTeacherRatings(validId, {
        page: pageParam,
        size,
        sort,
      }),
    initialPageParam: 0,
    getNextPageParam: getPaginatedNextPageParam,
    getPreviousPageParam: getPaginatedPrevPageParam,
    enabled: Boolean(teacherId && teacherId.trim().length > 0),
    ...options,
  });
}
