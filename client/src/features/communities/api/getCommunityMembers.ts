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
import { communityKeys } from "./communityKeys";

export interface CommunityMembersQueryParams {
  search?: string;
  role?: CommunityMemberRole;
  page?: number;
  size?: number;
  sort?: string;
}

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
        search: search ? search.trim() : undefined,
        role,
        sort,
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
    queryKey: communityKeys.membersList(communitySlug, { search, role }),
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
      ReturnType<typeof communityKeys.membersList>,
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
    queryKey: communityKeys.membersList(communitySlug, {
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
