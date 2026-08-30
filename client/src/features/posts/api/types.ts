import type { Post, Comment, CommunicationChannel } from "@/types/domain";

export interface CreatePostPayload {
  title: string;
  description: string;
}

export interface UpdatePostPayload {
  title?: string;
  description?: string;
}

export interface PinPostPayload {
  pinned: boolean;
}

export interface CommunityPostTarget {
  type: "community";
  communitySlug: string;
}

export interface CoursePostTarget {
  type: "course";
  communitySlug: string;
  studyYearSlug: string;
  courseSlug: string;
}

export type PostTarget = CommunityPostTarget | CoursePostTarget;

export type { Post, Comment, CommunicationChannel };
