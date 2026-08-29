import { RegisterForm } from "@/features/auth/components/RegisterForm";
import { LoginForm } from "@/features/auth/components/LoginForm";
import { ForgotPasswordModal } from "@/features/auth/components/ForgotPasswordModal";
import NonAuthenticatedRoute from "@/features/auth/components/NonAuthenticatedRoute";
import AuthenticatedRoute from "@/features/auth/components/AuthenticatedRoute";
import {
  loginSchema,
  registerSchema,
  type LoginFormData,
  type RegisterFormData,
} from "@/features/auth/schemas/authSchemas";
import useAuthStore from "./store/useAuthStore";
import { refresh } from "./api/refresh";
import { register, useRegister } from "./api/register";
import { confirmRegister, useConfirmRegister } from "./api/confirmRegister";
import { verifyEmail, useVerifyEmail } from "./api/verifyEmail";
import { confirmEmail, useConfirmEmail } from "./api/confirmEmail";
import { forgotPassword, useForgotPassword } from "./api/forgotPassword";
import { resetPassword, useResetPassword } from "./api/resetPassword";
import type { RefreshResponse, SessionResponse, MessageResponse } from "./types";

export {
  refresh,
  register,
  useRegister,
  confirmRegister,
  useConfirmRegister,
  verifyEmail,
  useVerifyEmail,
  confirmEmail,
  useConfirmEmail,
  forgotPassword,
  useForgotPassword,
  resetPassword,
  useResetPassword,
  RegisterForm,
  LoginForm,
  ForgotPasswordModal,
  NonAuthenticatedRoute,
  AuthenticatedRoute,
  useAuthStore,
  loginSchema,
  registerSchema,
  type LoginFormData,
  type RegisterFormData,
  type RefreshResponse,
  type SessionResponse,
  type MessageResponse,
};
