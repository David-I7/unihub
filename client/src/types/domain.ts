export type User = {
  id: string;
  username: string;
  email: string;
};

export type GlobalRole = "USER" | "ROOT" | "ADMIN";

export type UserProfile = {
  globalRole: GlobalRole;
  globalPermissions: string[];
} & User;

export type AuthProvider = "GOOGLE" | "GITHUB";
