import client from "@/api/client";
import {
  getPaginatedNextPageParam,
  getPaginatedPrevPageParam,
  type PaginatedResponse,
} from "@/api/types";
import type { CommunityMember, CommunityMemberRole } from "./types";
import {
  useInfiniteQuery,
  useQuery,
  keepPreviousData,
  type InfiniteData,
  type UseInfiniteQueryOptions,
  type UseQueryOptions,
} from "@tanstack/react-query";

export interface CommunityMembersQueryParams {
  search?: string;
  role?: CommunityMemberRole;
  page?: number;
  size?: number;
  sort?: string;
}

export const memberKeys = {
  all: ["communityMembers"] as const,
  list: (
    communitySlug: string,
    filters?: { search?: string; role?: CommunityMemberRole },
  ) => [...memberKeys.all, communitySlug, filters] as const,
};

export async function getCommunityMembers(
  communitySlug: string,
  params: CommunityMembersQueryParams = {},
): Promise<PaginatedResponse<CommunityMember>> {
  const { page = 0, size = 20, search, role, sort } = params;
  const response = await client.get<PaginatedResponse<CommunityMember>>(
    `/communities/${communitySlug}/members`,
    {
      params: {
        page,
        size,
        ...(search && search.trim().length > 0
          ? { search: search.trim() }
          : {}),
        ...(role ? { role } : {}),
        ...(sort ? { sort } : {}),
      },
    },
  );
  return response.data;
}

export function useCommunityMembers(
  communitySlug: string,
  params: CommunityMembersQueryParams = {},
  options?: Omit<
    UseQueryOptions<PaginatedResponse<CommunityMember>>,
    "queryKey" | "queryFn"
  >,
) {
  const { search, role } = params;
  return useQuery({
    queryKey: memberKeys.list(communitySlug, { search, role }),
    queryFn: () => getCommunityMembers(communitySlug, params),
    placeholderData: keepPreviousData,
    enabled: Boolean(communitySlug && communitySlug.trim().length > 0),
    ...options,
  });
}

export function useInfiniteCommunityMembers(
  communitySlug: string,
  params: {
    search?: string;
    role?: CommunityMemberRole;
    size?: number;
    sort?: string;
  } = {},
  options?: Omit<
    UseInfiniteQueryOptions<
      PaginatedResponse<CommunityMember>,
      Error,
      InfiniteData<PaginatedResponse<CommunityMember>>,
      ReturnType<typeof memberKeys.list>,
      number
    >,
    | "queryKey"
    | "queryFn"
    | "initialPageParam"
    | "getNextPageParam"
    | "getPreviousPageParam"
  >,
) {
  const { size = 20, search = "", role, sort } = params;

  return useInfiniteQuery({
    queryKey: memberKeys.list(communitySlug, {
      search: search.trim() || undefined,
      role: role || undefined,
    }),
    queryFn: ({ pageParam }) =>
      getCommunityMembers(communitySlug, {
        page: pageParam,
        size,
        search: search.trim() || undefined,
        role: role || undefined,
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
