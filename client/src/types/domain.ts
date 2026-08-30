export type User = {
  id: string;
  username: string;
  email: string;
  emailVerified: boolean;
  role: GlobalRole;
};

export type GlobalRole = "USER" | "ROOT" | "ADMIN";

export type UserProfile = {
  emailVerified: boolean;
  createdAt: string;
  globalRole: GlobalRole;
  globalPermissions: string[];
} & User;

export type AuthProvider = "GOOGLE" | "GITHUB";

export type CommunicationChannel = "COMMUNITY" | "COURSE_OFFERING" | "GENERAL";

export type ResourceOwner = {
  id: string;
  username: string;
  active: boolean;
};

export interface Comment {
  id: string;
  postId: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
  owner: ResourceOwner;
}

export interface Post {
  id: string;
  title: string;
  description: string;
  channel: CommunicationChannel;
  pinned: boolean;
  likesCount: number;
  commentsCount: number;
  createdAt: string;
  updatedAt?: string;
  owner: ResourceOwner;
  isLiked?: boolean;
}
