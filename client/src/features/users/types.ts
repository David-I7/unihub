export interface UserProfileResponse {
  id: string; // UUID
  username: string;
  email: string;
  role: string; // "USER" | "ADMIN" | "ROOT"
  permissions: string[]; // e.g. ["create:community"]
  createdAt: string; // ISO-8601 string (e.g. "2026-08-26T18:00:00Z")
}

export interface UserEnrolledCommunity {
  id: string; // UUID
  name: string;
  slug: string;
  description: string;
  memberCount: number;
  role: string; // "COMMUNITY_OWNER" | "COMMUNITY_ADMIN" | "COMMUNITY_MEMBER"
  permissions: string[]; // e.g. ["manage:content", "rate:teacher"]
  joinedAt: string; // ISO-8601 string
}

export interface UserCommunitiesResponse {
  communities: UserEnrolledCommunity[];
  permissions: string[]; // Deduplicated union of all community-level permissions
}
