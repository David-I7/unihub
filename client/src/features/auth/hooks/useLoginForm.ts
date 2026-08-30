import { useNavigate, useSearchParams } from "react-router";
import { useForm } from "@/hooks/useForm";
import { useLogin } from "../api/login";
import type { LoginRequest } from "../api/types";
import { loginSchema, type LoginFormData } from "../schemas/authSchemas";
import { getFormErrors } from "@/api/types";

export interface UseLoginFormOptions {
  onSuccess?: () => void;
  redirectTo?: string;
}

export function useLoginForm(options?: UseLoginFormOptions) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
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
        } else {
          const redirectTarget = options?.redirectTo ?? searchParams.get("redirect") ?? "/";
          navigate(redirectTarget);
        }
      } catch (err) {
        const formErrors = getFormErrors(err);

        if (formErrors.server) {
          form.setServerError(formErrors.server);
          return;
        }

        const errors: typeof form.errors = {};

        for (const error of formErrors.validation!) {
          if (error.type === "FIELD" && error.field === "password") {
            errors[error.field] = error.message;
          } else {
            errors["identifier"] = error.message;
          }
        }
        form.setErrors(errors);
      }
    },
  });

  return {
    ...form,
    isLoading: loginMutation.isPending || form.isSubmitting,
  };
}
