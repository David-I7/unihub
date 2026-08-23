import { useNavigate } from "react-router";
import { isAxiosError } from "axios";
import { useForm } from "@/hooks/useForm";
import { useLogin } from "../api/login";
import type { LoginRequest } from "../types";
import { loginSchema, type LoginFormData } from "../schemas/authSchemas";
import type { ApiError } from "@/api/types";

export interface UseLoginFormOptions {
  onSuccess?: () => void;
  redirectTo?: string;
}

export function useLoginForm(options?: UseLoginFormOptions) {
  const navigate = useNavigate();
  const loginMutation = useLogin();

  const form = useForm<LoginFormData>({
    initialValues: {
      identifier: "",
      password: "",
    },
    schema: loginSchema,
    onSubmit: async (values) => {
      try {
        const trimmed = values.identifier.trim();
        const isEmail = trimmed.includes("@");
        const loginPayload: LoginRequest = isEmail
          ? { email: trimmed, password: values.password }
          : { username: trimmed, password: values.password };

        await loginMutation.mutateAsync(loginPayload);

        if (options?.onSuccess) {
          options.onSuccess();
        } else navigate(options?.redirectTo ?? "/");
      } catch (err) {
        if (isAxiosError(err)) {
          const apiError: ApiError = err.response!.data;

          if (!apiError.errors) {
            form.setServerError(apiError.detail || apiError.title);
          }

          const errors: typeof form.errors = {};

          for (const error of apiError.errors!) {
            if (error.type === "FIELD") {
              errors[error.field as keyof typeof errors] = error.message;
            } else {
              errors["identifier"] = error.message;
            }
          }
          form.setErrors(errors);
        } else {
          form.setServerError(
            "An unexpected error occurred. Please try again.",
          );
        }
      }
    },
  });

  return {
    ...form,
    isLoading: loginMutation.isPending || form.isSubmitting,
  };
}
