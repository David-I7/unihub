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
  communityMembers: (slug: string) =>
    [...communityKeys.allMembers, slug] as const,
  membersList: (
    communitySlug: string,
    filters?: { search?: string; role?: CommunityMemberRole },
  ) => [...communityKeys.communityMembers(communitySlug), filters] as const,
  allMemberships: ["communities", "membership"] as const,
  membershipDetail: (slug: string) =>
    [...communityKeys.allMemberships, slug] as const,
  allStudyYears: ["communities", "study-years"] as const,
  communityStudyYears: (slug: string) =>
    [...communityKeys.allStudyYears, slug] as const,
  allReadme: ["communities", "readme"] as const,
  readmeDetail: (slug: string) => [...communityKeys.allReadme, slug] as const,
};
