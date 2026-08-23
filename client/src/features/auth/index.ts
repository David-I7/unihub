import { RegisterForm } from "@/features/auth/components/RegisterForm";
import { LoginForm } from "@/features/auth/components/LoginForm";
import NonAuthenticatedRoute from "@/features/auth/components/NonAuthenticatedRoute";
import { useLoginForm } from "@/features/auth/hooks/useLoginForm";
import { useRegisterForm } from "@/features/auth/hooks/useRegisterForm";
import {
  loginSchema,
  registerSchema,
  type LoginFormData,
  type RegisterFormData,
} from "@/features/auth/schemas/authSchemas";

export {
  RegisterForm,
  LoginForm,
  NonAuthenticatedRoute,
  useLoginForm,
  useRegisterForm,
  loginSchema,
  registerSchema,
  type LoginFormData,
  type RegisterFormData,
};
