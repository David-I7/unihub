import type { CommunitiesQueryParams } from "./getCommunities";
import type { CommunityMemberRole } from "./types";

export const communityKeys = {
  all: ["communities"] as const,
  communityInfinities: () => [...communityKeys.all, "infinite"] as const,
  infinite: (params: CommunitiesQueryParams) =>
    [...communityKeys.communityInfinities(), params] as const,
  allHome: ["communities", "home"] as const,
  homeDetail: (slug: string) => [...communityKeys.allHome, slug] as const,
  allMembers: ["communities", "members"] as const,
  membersList: (
    communitySlug: string,
    filters?: { search?: string; role?: CommunityMemberRole },
  ) => [...communityKeys.allMembers, communitySlug, filters] as const,
  allMemberships: ["communities", "membership"] as const,
  membershipDetail: (slug: string) =>
    [...communityKeys.allMemberships, slug] as const,
  allCommunityPosts: ["communities", "posts"] as const,
  communityPostinfinite: (slug: string, params: { size?: number }) =>
    [...communityKeys.allCommunityPosts, slug, "infinite", params] as const,
  allStudyYears: ["communities", "study-years"] as const,
  studyYearDetail: (slug: string) =>
    [...communityKeys.allStudyYears, slug] as const,
};
