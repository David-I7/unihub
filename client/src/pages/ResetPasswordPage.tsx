import * as React from "react";
import { useSearchParams, useNavigate, Link } from "react-router";
import { isAxiosError } from "axios";
import { z } from "zod";
import { CheckCircle2, AlertTriangle, KeyRound, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useForm } from "@/hooks/useForm";
import { useResetPassword } from "@/features/auth/api/resetPassword";
import useAuthStore from "@/features/auth/store/useAuthStore";

const resetPasswordSchema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();
  const clearAuth = useAuthStore((state) => state.clearAuth);

  const [isSuccess, setIsSuccess] = React.useState(false);
  const { mutateAsync: resetPasswordMutation, isPending } = useResetPassword();

  const form = useForm<ResetPasswordFormData>({
    initialValues: {
      password: "",
      confirmPassword: "",
    },
    schema: resetPasswordSchema,
    onSubmit: async (values) => {
      if (!token) return;
      try {
        form.setServerError(null);
        await resetPasswordMutation({
          token,
          newPassword: values.password,
        });
        clearAuth();
        setIsSuccess(true);
      } catch (err) {
        if (isAxiosError(err)) {
          form.setServerError(
            err.response?.data?.message ||
              err.response?.data?.detail ||
              "Password reset link has expired or is invalid. Please request a new link.",
          );
        } else {
          form.setServerError("An unexpected error occurred. Please try again.");
        }
      }
    },
  });

  if (!token) {
    return (
      <div className="flex flex-1 min-h-full w-full flex-col items-center justify-center p-4 my-auto animate-in fade-in duration-200">
        <div className="w-full max-w-md rounded-2xl border bg-card p-6 sm:p-8 shadow-xs flex flex-col items-center gap-5 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <AlertTriangle className="size-6" />
          </div>
          <div className="flex flex-col gap-1">
            <h1 className="text-xl font-bold font-heading text-foreground">
              Invalid or missing link
            </h1>
            <p className="text-xs text-muted-foreground text-balance">
              This password reset link is invalid or has already been used. Please request a new password reset link.
            </p>
          </div>
          <Button
            type="button"
            onClick={() => navigate("/login")}
            className="w-full h-9 text-xs font-semibold cursor-pointer"
          >
            Back to login
          </Button>
        </div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="flex flex-1 min-h-full w-full flex-col items-center justify-center p-4 my-auto animate-in fade-in duration-200">
        <div className="w-full max-w-md rounded-2xl border bg-card p-6 sm:p-8 shadow-xs flex flex-col items-center gap-5 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600">
            <CheckCircle2 className="size-6" />
          </div>
          <div className="flex flex-col gap-2">
            <h1 className="text-xl font-bold font-heading text-foreground">
              Password reset successfully
            </h1>
            <p className="text-xs text-muted-foreground text-balance">
              Your password has been reset. You may safely close this tab or proceed to login with your new password.
            </p>
          </div>
          <Button
            type="button"
            onClick={() => navigate("/login")}
            className="w-full h-9 text-xs font-semibold cursor-pointer"
          >
            Proceed to login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 min-h-full w-full flex-col items-center justify-center p-4 my-auto animate-in fade-in duration-200">
      <form
        onSubmit={form.handleSubmit}
        noValidate
        className="w-full max-w-md rounded-2xl border bg-card p-6 sm:p-8 shadow-xs flex flex-col gap-6"
      >
        <FieldGroup>
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <KeyRound className="size-6" />
            </div>
            <h1 className="text-2xl font-bold font-heading text-foreground">
              Set a new password
            </h1>
            <p className="text-xs text-balance text-muted-foreground">
              Enter your new secure password below to regain access to your account.
            </p>
          </div>

          {form.serverError && (
            <FieldError className="rounded-md border border-destructive/20 bg-destructive/10 p-3 text-center text-xs">
              {form.serverError}
            </FieldError>
          )}

          <Field data-invalid={form.isInvalid("password")}>
            <FieldLabel htmlFor="new-password" className="text-xs font-semibold">
              New Password
            </FieldLabel>
            <Input
              {...form.getFieldProps("password")}
              id="new-password"
              type="password"
              placeholder="••••••••"
              autoComplete="new-password"
              className="h-9 text-xs"
              autoFocus
            />
            {form.touched.password && form.errors.password && (
              <FieldError errors={[{ message: form.errors.password }]} />
            )}
          </Field>

          <Field data-invalid={form.isInvalid("confirmPassword")}>
            <FieldLabel htmlFor="confirm-password" className="text-xs font-semibold">
              Confirm New Password
            </FieldLabel>
            <Input
              {...form.getFieldProps("confirmPassword")}
              id="confirm-password"
              type="password"
              placeholder="••••••••"
              autoComplete="new-password"
              className="h-9 text-xs"
            />
            {form.touched.confirmPassword && form.errors.confirmPassword && (
              <FieldError errors={[{ message: form.errors.confirmPassword }]} />
            )}
          </Field>

          <Field>
            <Button
              type="submit"
              disabled={isPending || form.isSubmitting}
              className="w-full h-9 font-semibold text-xs cursor-pointer"
            >
              {isPending || form.isSubmitting ? "Resetting..." : "Reset Password"}
            </Button>
          </Field>

          <div className="flex justify-center pt-1">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              <ArrowLeft className="size-3.5" />
              Back to login
            </Link>
          </div>
        </FieldGroup>
      </form>
    </div>
  );
}
