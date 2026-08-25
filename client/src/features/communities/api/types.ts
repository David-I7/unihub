import type { StudyYearSummary } from "@/features/studyYears";
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

export interface CommunityDetail extends Community {
  studyYears: StudyYearSummary[];
}

export type {
  StudyYearSummary,
  CommunicationChannel,
  Comment,
  Post,
  ResourceOwner,
};
