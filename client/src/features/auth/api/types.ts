import type { AuthProvider, User } from "@/types/domain";

export type MessageResponse = {
  message: string;
};

export type RefreshResponse = {
  accessToken: string;
  user: User;
};

export type SessionResponse = RefreshResponse;

export type RegisterRequest = {
  username: string;
  password: string;
  email: string;
};

export type ConfirmRegisterRequest = {
  email: string;
  code: string;
};

export type ConfirmEmailRequest = {
  email: string;
  code: string;
};

export type VerifyEmailRequest = {
  email: string;
};

export type ForgotPasswordRequest = {
  email: string;
};

export type ResetPasswordRequest = {
  token: string;
  newPassword: string;
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
