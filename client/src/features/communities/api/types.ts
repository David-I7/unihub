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
  memberCount: number;
  createdAt: string;
  backgroundColor: string;
  verified: boolean;
  slug: string;
  owner: ResourceOwner;
};

export type CreateCommunityDto = {
  name: string;
  description: string;
  backgroundColor: string;
  slug: string;
};

export type CommunityHome = {
  community: Community;
  studyYears: StudyYearMetrics[];
};

export type CommunityStudyYears = StudyYearIdentifiers[];

export type CommunityMemberRole =
  | "COMMUNITY_OWNER"
  | "COMMUNITY_ADMIN"
  | "COMMUNITY_MEMBER";

export type { StudyYear, CommunicationChannel, Comment, Post, ResourceOwner };
