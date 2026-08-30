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
  search?: string;
  verified?: boolean;
  joined?: boolean;
}

export interface CommunitiesPaginatedRequest extends PaginatedRequest {
  search?: string;
  verified?: boolean;
  joined?: boolean;
}

export async function getCommunities(
  request: CommunitiesPaginatedRequest,
): Promise<PaginatedResponse<Community>> {
  const response = await client.get<PaginatedResponse<Community>>(
    "/communities",
    { params: request },
  );
  return response.data;
}

export const communityKeys = {
  all: ["communities"] as const,
  list: (params: CommunitiesPaginatedRequest) =>
    [...communityKeys.all, "list", params] as const,
  infinite: (params: CommunitiesQueryParams) =>
    [...communityKeys.all, "infinite", params] as const,
};

export function useCommunities(params: CommunitiesPaginatedRequest) {
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
  const { size = 12, sort, search, verified, joined } = params;

  return useInfiniteQuery({
    queryKey: communityKeys.infinite({ size, sort, search, verified, joined }),
    queryFn: ({ pageParam }) =>
      getCommunities({
        page: pageParam,
        size,
        ...(sort ? { sort } : {}),
        ...(search ? { search } : {}),
        ...(verified !== undefined ? { verified } : {}),
        ...(joined !== undefined ? { joined } : {}),
      }),
    initialPageParam: 0,
    getNextPageParam: getPaginatedNextPageParam,
    getPreviousPageParam: getPaginatedPrevPageParam,
    ...options,
  });
}
