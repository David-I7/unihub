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
              Create a new account
            </h1>
            <p className="text-xs text-balance text-muted-foreground">
              Enter your email and username below to create your account
            </p>
          </div>

          {serverError && (
            <FieldError className="rounded-md border border-destructive/20 bg-destructive/10 p-3 text-center text-xs">
              {serverError}
            </FieldError>
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
            <FieldLabel htmlFor="username" className="text-xs font-semibold">
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
            <div className="flex items-center">
              <FieldLabel htmlFor="password" className="text-xs font-semibold">
                Password
              </FieldLabel>
              <a
                href="#"
                className="ml-auto text-xs text-muted-foreground underline-offset-4 hover:underline hover:text-foreground"
              >
                Forgot your password?
              </a>
            </div>
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
              disabled={isLoading}
              className="w-full h-9 font-semibold text-xs cursor-pointer"
            >
              {isLoading ? "Signing up..." : "Sign up"}
            </Button>
          </Field>

          <FieldSeparator className="text-xs text-muted-foreground">
            Or
          </FieldSeparator>

          <FieldGroup>
            <Field>
              <GoogleLogin
                onOpen={() => handleOpen("GOOGLE")}
                onSuccess={handleProviderSuccess}
                onFailure={handleFailure}
                onClose={handleClose}
                disabled={activeProvider !== null}
              />
              {providerLoginError &&
                providerLoginError.provider === "GOOGLE" && (
                  <FieldError
                    errors={[{ message: providerLoginError.message }]}
                  />
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
              {providerLoginError &&
                providerLoginError.provider === "GITHUB" && (
                  <FieldError
                    errors={[{ message: providerLoginError.message }]}
                  />
                )}
            </Field>
            <FieldDescription className="text-center text-xs">
              Already have an account?{" "}
              <Button
                type="button"
                size="link"
                onClick={() => navigate("/login")}
                variant="link"
                className="text-xs font-semibold cursor-pointer"
              >
                Login
              </Button>
            </FieldDescription>
          </FieldGroup>
        </FieldGroup>
      </form>
    </div>
  );
}
