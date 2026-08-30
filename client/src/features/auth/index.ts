import { RegisterForm } from "@/features/auth/components/RegisterForm";
import { LoginForm } from "@/features/auth/components/LoginForm";
import { ForgotPasswordModal } from "@/features/auth/components/ForgotPasswordModal";
import { VerifyEmailModal } from "@/features/auth/components/VerifyEmailModal";
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
import type {
  RefreshResponse,
  SessionResponse,
  MessageResponse,
} from "./api/types";
import type { ForgotPasswordModalProps } from "@/features/auth/components/ForgotPasswordModal";
import type { VerifyEmailModalProps } from "@/features/auth/components/VerifyEmailModal";

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
  VerifyEmailModal,
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
  type ForgotPasswordModalProps,
  type VerifyEmailModalProps,
};
