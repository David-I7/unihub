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
  role: CommunityMemberRole;
  joinedAt: string;
}
