import client from "@/api/client";
import {
  getPaginatedNextPageParam,
  getPaginatedPrevPageParam,
  type PaginatedRequest,
} from "@/api/types";
import type { StudyYearHome } from "./types";
import {
  useInfiniteQuery,
  useQuery,
  keepPreviousData,
  type InfiniteData,
  type UseInfiniteQueryOptions,
} from "@tanstack/react-query";

export interface StudyYearHomeQueryParams {
  search?: string;
  semester?: number;
  archived?: boolean;
  size?: number;
  sort?: string;
}

export interface StudyYearHomePaginatedRequest extends PaginatedRequest {
  search?: string;
  semester?: number;
  archived?: boolean;
}

export async function getStudyYearHome(
  communitySlug: string,
  studyYearName: string,
  params: StudyYearHomePaginatedRequest = { page: 0, size: 12 },
): Promise<StudyYearHome> {
  const { page = 0, size = 12, search, semester, archived = false, sort } = params;
  const response = await client.get<StudyYearHome>(
    `/communities/${communitySlug}/study-years/${studyYearName}/home`,
    {
      params: {
        page,
        size,
        ...(search ? { search: search.trim() } : {}),
        ...(semester !== undefined ? { semester } : {}),
        ...(archived !== undefined ? { archived } : {}),
        ...(sort ? { sort } : {}),
      },
    },
  );
  return response.data;
}

export const studyYearHomeKeys = {
  all: ["study-years", "home"] as const,
  byStudyYear: (communitySlug: string, studyYearName: string) =>
    [...studyYearHomeKeys.all, communitySlug, studyYearName] as const,
  byStudyYearInfinite: (communitySlug: string, studyYearName: string) =>
    [...studyYearHomeKeys.all, "infinite", communitySlug, studyYearName] as const,
  courses: (
    communitySlug: string,
    studyYearName: string,
    params: StudyYearHomePaginatedRequest = { page: 0, size: 12 },
  ) =>
    [
      ...studyYearHomeKeys.byStudyYear(communitySlug, studyYearName),
      params,
    ] as const,
  infinite: (
    communitySlug: string,
    studyYearName: string,
    params: StudyYearHomeQueryParams = {},
  ) =>
    [
      ...studyYearHomeKeys.byStudyYearInfinite(communitySlug, studyYearName),
      params,
    ] as const,
};

export function useStudyYearHome(
  communitySlug: string,
  studyYearName: string,
  params: StudyYearHomePaginatedRequest = { page: 0, size: 12 },
) {
  return useQuery({
    queryKey: studyYearHomeKeys.courses(communitySlug, studyYearName, params),
    queryFn: () => getStudyYearHome(communitySlug, studyYearName, params),
    placeholderData: keepPreviousData,
    enabled: communitySlug.length > 0 && studyYearName.length > 0,
  });
}

export function useInfiniteStudyYearHome(
  communitySlug: string,
  studyYearName: string,
  params: StudyYearHomeQueryParams = {},
  options?: Omit<
    UseInfiniteQueryOptions<
      StudyYearHome,
      Error,
      InfiniteData<StudyYearHome>,
      ReturnType<typeof studyYearHomeKeys.infinite>,
      number
    >,
    | "queryKey"
    | "queryFn"
    | "initialPageParam"
    | "getNextPageParam"
    | "getPreviousPageParam"
  >,
) {
  const { size = 12, search, semester, archived, sort } = params;

  return useInfiniteQuery({
    queryKey: studyYearHomeKeys.infinite(communitySlug, studyYearName, {
      size,
      search,
      semester,
      archived,
      sort,
    }),
    queryFn: ({ pageParam }) =>
      getStudyYearHome(communitySlug, studyYearName, {
        page: pageParam,
        size,
        search,
        semester,
        archived,
        sort,
      }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => getPaginatedNextPageParam(lastPage.courses),
    getPreviousPageParam: (firstPage) =>
      getPaginatedPrevPageParam(firstPage.courses),
    enabled: communitySlug.length > 0 && studyYearName.length > 0,
    placeholderData: keepPreviousData,
    ...options,
  });
}

