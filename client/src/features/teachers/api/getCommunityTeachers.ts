import client from "@/api/client";
import {
  getPaginatedNextPageParam,
  getPaginatedPrevPageParam,
  type PaginatedRequest,
  type PaginatedResponse,
} from "@/api/types";
import type { Teacher } from "./types";
import { teacherKeys } from "./keys";
import {
  useInfiniteQuery,
  useQuery,
  keepPreviousData,
  type InfiniteData,
  type UseInfiniteQueryOptions,
  type UseQueryOptions,
} from "@tanstack/react-query";

export interface CommunityTeachersQueryParams {
  search?: string;
  studyYear?: string;
  semester?: number;
  page?: number;
  size?: number;
  sort?: string;
}

export interface CommunityTeachersPaginatedRequest extends PaginatedRequest {
  search?: string;
  studyYear?: string;
  semester?: number;
}

export async function getCommunityTeachers(
  communitySlug: string,
  params: CommunityTeachersQueryParams = {},
): Promise<PaginatedResponse<Teacher>> {
  const { page = 0, size = 12, search, studyYear, semester, sort } = params;
  const response = await client.get<PaginatedResponse<Teacher>>(
    `/communities/${communitySlug}/teachers`,
    {
      params: {
        page,
        size,
        ...(search && search.trim().length > 0 ? { search: search.trim() } : {}),
        ...(studyYear ? { studyYear } : {}),
        ...(semester !== undefined && semester !== null ? { semester } : {}),
        ...(sort ? { sort } : {}),
      },
    },
  );
  return response.data;
}

export function useCommunityTeachers(
  communitySlug: string,
  params: CommunityTeachersQueryParams = {},
  options?: Omit<
    UseQueryOptions<PaginatedResponse<Teacher>>,
    "queryKey" | "queryFn"
  >,
) {
  const { search, studyYear, semester } = params;
  return useQuery({
    queryKey: teacherKeys.list(communitySlug, { search, studyYear, semester }),
    queryFn: () => getCommunityTeachers(communitySlug, params),
    placeholderData: keepPreviousData,
    enabled: Boolean(communitySlug && communitySlug.trim().length > 0),
    ...options,
  });
}

export function useInfiniteCommunityTeachers(
  communitySlug: string,
  params: {
    search?: string;
    studyYear?: string;
    semester?: number;
    size?: number;
    sort?: string;
  } = {},
  options?: Omit<
    UseInfiniteQueryOptions<
      PaginatedResponse<Teacher>,
      Error,
      InfiniteData<PaginatedResponse<Teacher>>,
      ReturnType<typeof teacherKeys.list>,
      number
    >,
    | "queryKey"
    | "queryFn"
    | "initialPageParam"
    | "getNextPageParam"
    | "getPreviousPageParam"
  >,
) {
  const { size = 12, search = "", studyYear, semester, sort } = params;

  return useInfiniteQuery({
    queryKey: teacherKeys.list(communitySlug, {
      search: search.trim() || undefined,
      studyYear: studyYear || undefined,
      semester,
    }),
    queryFn: ({ pageParam }) =>
      getCommunityTeachers(communitySlug, {
        page: pageParam,
        size,
        search: search.trim() || undefined,
        studyYear: studyYear || undefined,
        semester,
        sort,
      }),
    initialPageParam: 0,
    getNextPageParam: getPaginatedNextPageParam,
    getPreviousPageParam: getPaginatedPrevPageParam,
    placeholderData: keepPreviousData,
    enabled: Boolean(communitySlug && communitySlug.trim().length > 0),
    ...options,
  });
}
