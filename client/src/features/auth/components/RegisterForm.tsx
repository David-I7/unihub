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
import { RegisterVerificationStep } from "./RegisterVerificationStep";
import { useRegisterForm } from "../hooks/useRegisterForm";
import useProviderForm from "../hooks/useProviderForm";
import { useNavigate, useSearchParams } from "react-router";
import { relativeUrlSchema } from "../schemas/authSchemas";
export function RegisterForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [registeredEmail, setRegisteredEmail] = React.useState<string | null>(
    null,
  );
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const shouldRedirect = relativeUrlSchema.safeParse(
    searchParams.get("redirect"),
  ).success;

  const {
    handleSuccess: handleProviderSuccess,
    handleFailure,
    handleOpen,
    handleClose,
    error: providerLoginError,
    activeProvider,
  } = useProviderForm();

  const {
    errors,
    touched,
    getFieldProps,
    handleSubmit,
    isLoading: isRegisterLoading,
    serverError,
    isInvalid,
  } = useRegisterForm({
    onRegistered: (email) => {
      setRegisteredEmail(email);
    },
  });

  const handleRegistrationSuccess = React.useCallback(() => {
    setRegisteredEmail(null);
    navigate(shouldRedirect ? searchParams.get("redirect")! : "/");
  }, []);

  return (
    <div
      className={cn(
        "flex flex-1 min-h-full w-full flex-col items-center justify-center p-4 my-auto animate-in fade-in duration-200",
        className,
      )}
      {...props}
    >
      <div className="w-full max-w-md rounded-2xl border bg-card p-6 sm:p-8 shadow-xs flex flex-col gap-6">
        {registeredEmail ? (
          <RegisterVerificationStep
            email={registeredEmail}
            onSuccess={handleRegistrationSuccess}
          />
        ) : (
          <form
            onSubmit={handleSubmit}
            noValidate
            className="flex flex-col gap-6"
          >
            <FieldGroup>
              <div className="flex flex-col items-center gap-1 text-center">
                <h1 className="text-2xl font-bold font-heading text-foreground">
                  Create a new account
                </h1>
                <p className="text-xs text-balance text-muted-foreground">
                  Enter your email and username below to create your account
                </p>
              </div>

              {serverError && (
                <div className="flex flex-col gap-1.5 rounded-md border border-destructive/20 bg-destructive/10 p-3 text-center text-xs">
                  <span className="text-destructive">{serverError}</span>
                </div>
              )}

              <Field data-invalid={isInvalid("email")}>
                <FieldLabel htmlFor="email" className="text-xs font-semibold">
                  Email
                </FieldLabel>
                <Input
                  {...getFieldProps("email")}
                  type="email"
                  placeholder="john_doe@example.com"
                  autoComplete="email"
                  className="h-9 text-xs"
                />
                {touched.email && errors.email && (
                  <FieldError errors={[{ message: errors.email }]} />
                )}
              </Field>

              <Field data-invalid={isInvalid("username")}>
                <FieldLabel
                  htmlFor="username"
                  className="text-xs font-semibold"
                >
                  Username
                </FieldLabel>
                <Input
                  {...getFieldProps("username")}
                  type="text"
                  placeholder="john_doe"
                  autoComplete="username"
                  className="h-9 text-xs"
                />
                {touched.username && errors.username && (
                  <FieldError errors={[{ message: errors.username }]} />
                )}
              </Field>

              <Field data-invalid={isInvalid("password")}>
                <FieldLabel
                  htmlFor="password"
                  className="text-xs font-semibold"
                >
                  Password
                </FieldLabel>
                <Input
                  {...getFieldProps("password")}
                  type="password"
                  placeholder="••••••••"
                  autoComplete="new-password"
                  className="h-9 text-xs"
                />
                {touched.password && errors.password && (
                  <FieldError errors={[{ message: errors.password }]} />
                )}
              </Field>

              <Field>
                <Button
                  type="submit"
                  disabled={isRegisterLoading}
                  className="w-full h-9 font-semibold text-xs cursor-pointer"
                >
                  {isRegisterLoading ? "Signing up..." : "Sign up"}
                </Button>
              </Field>

              <SocialAuthSection
                onOpen={handleOpen}
                onSuccess={handleProviderSuccess}
                onFailure={handleFailure}
                onClose={handleClose}
                activeProvider={activeProvider}
                providerError={providerLoginError}
                footerText="Already have an account?"
                footerActionText="Login"
                footerActionTo={
                  shouldRedirect
                    ? `/login?redirect=${searchParams.get("redirect")!}`
                    : "/login"
                }
              />
            </FieldGroup>
          </form>
        )}
      </div>
    </div>
  );
}

export default RegisterForm;
