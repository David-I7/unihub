import type { AuthProvider, User } from "@/types/domain";

export type RefreshResponse = {
  accessToken: string;
  user: User;
};

export type RegisterRequest = {
  username: string;
  password: string;
  email: string;
};

export type LoginRequest =
  | {
      username: string;
      password: string;
    }
  | {
      email: string;
      password: string;
    };

export type OAuth2Response = {
  type: "OAUTH_SUCCESS" | "OAUTH_FAILURE";
  provider: AuthProvider;
};
