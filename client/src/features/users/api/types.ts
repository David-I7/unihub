import type { CommunityMemberRole } from "@/features/communities/api/types";
import type { GlobalRole } from "@/types/domain";

export interface UserProfileResponse {
  id: string;
  username: string;
  email: string;
  role: GlobalRole;
  emailVerified: boolean;
  permissions: string[];
  createdAt: string;
}

export interface UserEnrolledCommunity {
  id: string;
  name: string;
  slug: string;
  description: string;
  memberCount: number;
  role: CommunityMemberRole;
  permissions: string[];
  joinedAt: string;
}

export interface UserCommunitiesResponse {
  communities: UserEnrolledCommunity[];
  permissionsByRole: Record<CommunityMemberRole, string[]>;
}
