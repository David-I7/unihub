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
import GithubLogin from "./GithubLogin";
import GoogleLogin from "./GoogleLogin";
import { useNavigate } from "react-router";
import { useLoginForm } from "../hooks/useLoginForm";
import useProviderForm from "../hooks/useProviderForm";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const navigate = useNavigate();
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
    <form
      className={cn("flex flex-col gap-6", className)}
      onSubmit={handleSubmit}
      noValidate
      {...props}
    >
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Login to your account</h1>
          <p className="text-sm text-balance text-muted-foreground">
            Enter your email or username below to login to your account
          </p>
        </div>

        {serverError && (
          <FieldError className="rounded-md border border-destructive/20 bg-destructive/10 p-3 text-center text-sm">
            {serverError}
          </FieldError>
        )}

        <Field data-invalid={isInvalid("identifier")}>
          <FieldLabel htmlFor="identifier">Email or Username</FieldLabel>
          <Input
            {...getFieldProps("identifier")}
            type="text"
            placeholder="john_doe@example.com or john_doe"
            autoComplete="username"
          />
          {touched.identifier && errors.identifier && (
            <FieldError errors={[{ message: errors.identifier }]} />
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
            autoComplete="current-password"
          />
          {touched.password && errors.password && (
            <FieldError errors={[{ message: errors.password }]} />
          )}
        </Field>

        <Field>
          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? "Logging in..." : "Login"}
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
            Don&apos;t have an account?{" "}
            <Button
              type="button"
              size="link"
              onClick={() => navigate("/register")}
              variant="link"
            >
              Sign up
            </Button>
          </FieldDescription>
        </FieldGroup>
      </FieldGroup>
    </form>
  );
}
