import { isAxiosError } from "axios";
import { useForm } from "@/hooks/useForm";
import { useRegister } from "../api/register";
import { registerSchema, type RegisterFormData } from "../schemas/authSchemas";

export interface UseRegisterFormOptions {
  onRegistered?: (email: string) => void;
}

export function useRegisterForm(options?: UseRegisterFormOptions) {
  const registerMutation = useRegister();

  const form = useForm<RegisterFormData>({
    initialValues: {
      email: "",
      username: "",
      password: "",
    },
    schema: registerSchema,
    onSubmit: async (values) => {
      try {
        form.setServerError(null);
        await registerMutation.mutateAsync(values);
        if (options?.onRegistered) {
          options.onRegistered(values.email);
        }
      } catch (err) {
        if (isAxiosError(err)) {
          const message =
            err.response?.data?.message ||
            err.response?.data?.detail ||
            (err.response?.status === 409
              ? "An account with this email or username already exists."
              : "Registration failed. Please try again.");
          form.setServerError(message);
        } else {
          form.setServerError("An unexpected error occurred. Please try again.");
        }
      }
    },
  });

  return {
    ...form,
    isLoading: registerMutation.isPending || form.isSubmitting,
  };
}

