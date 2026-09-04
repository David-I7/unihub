import { useForm } from "@/hooks/useForm";
import { useRegister } from "../api/register";
import { registerSchema, type RegisterFormData } from "../schemas/authSchemas";
import { getFormErrors } from "@/api/types";

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
        const formErrors = getFormErrors(err);

        if (formErrors.server) {
          form.setServerError(formErrors.server);
          return;
        }

        const errors: typeof form.errors = {};

        for (const error of formErrors.validation!) {
          if (error.type === "FIELD") {
            errors[error.field as keyof typeof errors] = error.message;
          }
        }
        form.setErrors(errors);
      }
    },
  });

  return {
    ...form,
    isLoading: registerMutation.isPending || form.isSubmitting,
  };
}
