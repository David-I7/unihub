import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router";
import GoogleLogin from "./GoogleLogin";
import GithubLogin from "./GithubLogin";
import { useRegisterForm } from "../hooks/useRegisterForm";
import useProviderForm from "../hooks/useProviderForm";

export function RegisterForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const navigate = useNavigate();
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
    isLoading,
    serverError,
    isInvalid,
  } = useRegisterForm();

  return (
    <form
      className={cn("flex flex-col gap-6", className)}
      onSubmit={handleSubmit}
      noValidate
      {...props}
    >
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Create a new account</h1>
          <p className="text-sm text-balance text-muted-foreground">
            Enter your email and username below to create your account
          </p>
        </div>

        {serverError && (
          <FieldError className="rounded-md border border-destructive/20 bg-destructive/10 p-3 text-center text-sm">
            {serverError}
          </FieldError>
        )}

        <Field data-invalid={isInvalid("email")}>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input
            {...getFieldProps("email")}
            type="email"
            placeholder="john_doe@example.com"
            autoComplete="email"
          />
          {touched.email && errors.email && (
            <FieldError errors={[{ message: errors.email }]} />
          )}
        </Field>

        <Field data-invalid={isInvalid("username")}>
          <FieldLabel htmlFor="username">Username</FieldLabel>
          <Input
            {...getFieldProps("username")}
            type="text"
            placeholder="john_doe"
            autoComplete="username"
          />
          {touched.username && errors.username && (
            <FieldError errors={[{ message: errors.username }]} />
          )}
        </Field>

        <Field data-invalid={isInvalid("password")}>
          <div className="flex items-center">
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <a
              href="#"
              className="ml-auto text-sm underline-offset-4 hover:underline"
            >
              Forgot your password?
            </a>
          </div>
          <Input
            {...getFieldProps("password")}
            type="password"
            placeholder="••••••••"
            autoComplete="new-password"
          />
          {touched.password && errors.password && (
            <FieldError errors={[{ message: errors.password }]} />
          )}
        </Field>

        <Field>
          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? "Signing up..." : "Sign up"}
          </Button>
        </Field>

        <FieldSeparator>Or</FieldSeparator>

        <FieldGroup>
          <Field>
            <GoogleLogin
              onOpen={() => handleOpen("GOOGLE")}
              onSuccess={handleProviderSuccess}
              onFailure={handleFailure}
              onClose={handleClose}
              disabled={activeProvider !== null}
            />
            {providerLoginError && providerLoginError.provider === "GOOGLE" && (
              <FieldError errors={[{ message: providerLoginError.message }]} />
            )}
          </Field>
          <Field>
            <GithubLogin
              onOpen={() => handleOpen("GITHUB")}
              onSuccess={handleProviderSuccess}
              onFailure={handleFailure}
              onClose={handleClose}
              disabled={activeProvider !== null}
            />
            {providerLoginError && providerLoginError.provider === "GITHUB" && (
              <FieldError errors={[{ message: providerLoginError.message }]} />
            )}
          </Field>
          <FieldDescription className="text-center">
            Already have an account?{" "}
            <Button
              type="button"
              size="link"
              onClick={() => navigate("/login")}
              variant="link"
            >
              Login
            </Button>
          </FieldDescription>
        </FieldGroup>
      </FieldGroup>
    </form>
  );
}
