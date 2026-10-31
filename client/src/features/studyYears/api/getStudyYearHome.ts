import client from "@/api/client";
import {
  getPaginatedNextPageParam,
  getPaginatedPrevPageParam,
  type PaginatedRequest,
} from "@/api/types";
import type { StudyYearHome } from "./types";
import {
  useInfiniteQuery,
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
  const {
    page = 0,
    size = 12,
    search,
    semester,
    archived = false,
    sort,
  } = params;
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
  byStudyYear: (communitySlug: string, studyYearSlug: string) =>
    [...studyYearHomeKeys.all, communitySlug, studyYearSlug] as const,
  infinite: (
    communitySlug: string,
    studyYearSlug: string,
    params: StudyYearHomeQueryParams = {},
  ) =>
    [
      ...studyYearHomeKeys.byStudyYear(communitySlug, studyYearSlug),
      "infinite",
      params,
    ] as const,
};

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
