import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { SocialAuthSection } from "./SocialAuthSection";
import { ForgotPasswordModal } from "./ForgotPasswordModal";
import { useLoginForm } from "../hooks/useLoginForm";
import useProviderForm from "../hooks/useProviderForm";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = React.useState(false);

  const {
    handleSuccess: handleProviderSuccess,
    handleFailure,
    handleOpen,
    error: providerLoginError,
    activeProvider,
    handleClose,
  } = useProviderForm();

  const {
    errors,
    touched,
    getFieldProps,
    handleSubmit,
    isLoading,
    serverError,
    isInvalid,
  } = useLoginForm();

  return (
    <div className="flex flex-1 min-h-full w-full flex-col items-center justify-center p-4 my-auto animate-in fade-in duration-200">
      <form
        className={cn(
          "w-full max-w-md rounded-2xl border bg-card p-6 sm:p-8 shadow-xs flex flex-col gap-6",
          className,
        )}
        onSubmit={handleSubmit}
        noValidate
        {...props}
      >
        <FieldGroup>
          <div className="flex flex-col items-center gap-1 text-center">
            <h1 className="text-2xl font-bold font-heading text-foreground">
              Login to your account
            </h1>
            <p className="text-xs text-balance text-muted-foreground">
              Enter your email or username below to login to your account
            </p>
          </div>

          {serverError && (
            <FieldError className="rounded-md border border-destructive/20 bg-destructive/10 p-3 text-center text-xs">
              {serverError}
            </FieldError>
          )}

          <Field data-invalid={isInvalid("identifier")}>
            <FieldLabel htmlFor="identifier" className="text-xs font-semibold">
              Email or Username
            </FieldLabel>
            <Input
              {...getFieldProps("identifier")}
              type="text"
              placeholder="john_doe@example.com or john_doe"
              autoComplete="username"
              className="h-9 text-xs"
            />
            {touched.identifier && errors.identifier && (
              <FieldError errors={[{ message: errors.identifier }]} />
            )}
          </Field>

          <Field data-invalid={isInvalid("password")}>
            <div className="flex items-center">
              <FieldLabel htmlFor="password" className="text-xs font-semibold">
                Password
              </FieldLabel>
              <button
                type="button"
                onClick={() => setIsForgotPasswordOpen(true)}
                className="ml-auto text-xs text-muted-foreground underline-offset-4 hover:underline hover:text-foreground cursor-pointer"
              >
                Forgot your password?
              </button>
            </div>
            <Input
              {...getFieldProps("password")}
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
              className="h-9 text-xs"
            />
            {touched.password && errors.password && (
              <FieldError errors={[{ message: errors.password }]} />
            )}
          </Field>

          <Field>
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-9 font-semibold text-xs cursor-pointer"
            >
              {isLoading ? "Logging in..." : "Login"}
            </Button>
          </Field>

          <SocialAuthSection
            onOpen={handleOpen}
            onSuccess={handleProviderSuccess}
            onFailure={handleFailure}
            onClose={handleClose}
            activeProvider={activeProvider}
            providerError={providerLoginError}
            footerText="Don't have an account?"
            footerActionText="Sign up"
            footerActionTo={
              new URLSearchParams(window.location.search).get("redirect")
                ? `/register?redirect=${encodeURIComponent(new URLSearchParams(window.location.search).get("redirect")!)}`
                : "/register"
            }
          />
        </FieldGroup>
      </form>

      <ForgotPasswordModal
        open={isForgotPasswordOpen}
        onOpenChange={setIsForgotPasswordOpen}
      />
    </div>
  );
}

export default LoginForm;

