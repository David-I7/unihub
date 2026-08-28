import client from "@/api/client";
import {
  getPaginatedNextPageParam,
  getPaginatedPrevPageParam,
  type PaginatedRequest,
  type PaginatedResponse,
} from "@/api/types";
import type { Community } from "./types";
import {
  useInfiniteQuery,
  useQuery,
  keepPreviousData,
  type InfiniteData,
  type UseInfiniteQueryOptions,
} from "@tanstack/react-query";

export interface CommunitiesQueryParams {
  size?: number;
  sort?: string;
}

export async function getCommunities(
  request: PaginatedRequest,
): Promise<PaginatedResponse<Community>> {
  const response = await client.get<PaginatedResponse<Community>>(
    "/communities",
    { params: request },
  );
  return response.data;
}

export const communityKeys = {
  all: ["communities"] as const,
  list: (params: PaginatedRequest) =>
    [...communityKeys.all, "list", params] as const,
  infinite: (params: CommunitiesQueryParams) =>
    [...communityKeys.all, "infinite", params] as const,
};

export function useCommunities(params: PaginatedRequest) {
  return useQuery({
    queryKey: communityKeys.list(params),
    queryFn: () => getCommunities(params),
    placeholderData: keepPreviousData,
  });
}

export function useInfiniteCommunities(
  params: CommunitiesQueryParams = {},
  options?: Omit<
    UseInfiniteQueryOptions<
      PaginatedResponse<Community>,
      Error,
      InfiniteData<PaginatedResponse<Community>>,
      ReturnType<typeof communityKeys.infinite>,
      number
    >,
    | "queryKey"
    | "queryFn"
    | "initialPageParam"
    | "getNextPageParam"
    | "getPreviousPageParam"
  >,
) {
  const { size = 10, sort } = params;

  return useInfiniteQuery({
    queryKey: communityKeys.infinite({ size, sort }),
    queryFn: ({ pageParam }) =>
      getCommunities({
        page: pageParam,
        size,
        ...(sort ? { sort } : {}),
      }),
    initialPageParam: 0,
    getNextPageParam: getPaginatedNextPageParam,
    getPreviousPageParam: getPaginatedPrevPageParam,
    ...options,
  });
}
