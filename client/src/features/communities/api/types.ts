import type {
  StudyYear,
  StudyYearIdentifiers,
  StudyYearMetrics,
} from "@/features/studyYears";
import type {
  CommunicationChannel,
  Comment,
  Post,
  ResourceOwner,
} from "@/types/domain";

export type Community = {
  id: string;
  name: string;
  description: string;
  readme?: string;
  memberCount: number;
  createdAt: string;
  backgroundColor: string;
  verified: boolean;
  slug: string;
  owner: ResourceOwner;
  isJoined: boolean;
};

export type CreateCommunityDto = {
  name: string;
  slug: string;
  description: string;
  readme?: string;
  backgroundColor: string;
};

export type UpdateCommunityDto = {
  name?: string;
  slug?: string;
  description?: string;
  readme?: string;
  backgroundColor?: string;
  verified?: boolean;
  newOwnerUsername?: string;
};

export type CallerMembership = {
  isMember: boolean;
  role: CommunityMemberRole | null;
  permissions: string[];
};

export type CommunityHome = {
  community: Community;
  studyYears: StudyYearMetrics[];
  callerMembership: CallerMembership;
};

export type CommunityStudyYears = StudyYearIdentifiers[];

export type CommunityMemberRole =
  | "COMMUNITY_OWNER"
  | "COMMUNITY_ADMIN"
  | "COMMUNITY_MEMBER";

export type CommunityJoinCode = {
  id: string;
  code: string;
  communityId: string;
  communitySlug: string;
  maxUses: number | null;
  usesCount: number;
  expiresAt: string | null;
  createdAt: string;
};

export type CommunityJoinPreviewResponse = {
  communityId: string;
  name: string;
  slug: string;
  description: string;
  backgroundColor: string;
  memberCount: number;
  verified: boolean;
  isMember: boolean;
};

export type CreateJoinCodeDto = {
  maxUses?: number;
  validForHours?: number;
};

export type UpdateJoinCodeDto = {
  maxUses?: number;
  validForHours?: number;
};

export type { StudyYear, CommunicationChannel, Comment, Post, ResourceOwner };
