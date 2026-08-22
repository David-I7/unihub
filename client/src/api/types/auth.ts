export type GLOBAL_ROLE = "USER" | "ADMIN" | "ROOT";

export type User = {
  id: string;
  email: string;
  username: string;
  createdAt: string;
  globalRole: GLOBAL_ROLE;
};

export type COMMUNITY_ROLE =
  | "COMMUNITY_MEMBER"
  | "COMMUNITY_OWNER"
  | "COMMUNITY_ADMIN";

export const PERMISSION = {
  // Global
  MANAGE_USERS: "manage:users",
  CREATE_COMMUNITY: "create:community",
  MANAGE_TEACHERS: "manage:teachers",
  MANAGE_RATING_METRICS: "manage:ratingMetrics",
  MODERATE_TEACHER_RATINGS: "moderate:teacherRatings",

  // Community Admin
  MANAGE_COMMUNITY: "manage:community",
  MANAGE_ACADEMIC_STRUCTURE: "manage:academicStructure",
  MANAGE_COMMUNITY_MEMBERS: "manage:communityMembers",
  MODERATE_COMMUNITY: "moderate:community",

  // Community Collaboration
  MANAGE_CONTENT: "manage:content",
  RATE_TEACHER: "rate:teacher",
};
