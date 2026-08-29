import * as React from "react";
import { useNavigate } from "react-router";
import { isAxiosError } from "axios";
import { toast } from "sonner";
import { Mail, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { OtpInput } from "@/components/ui/otp-input";
import { SocialAuthSection } from "./SocialAuthSection";
import { useRegisterForm } from "../hooks/useRegisterForm";
import useProviderForm from "../hooks/useProviderForm";
import { useConfirmRegister } from "../api/confirmRegister";
import { useVerifyEmail } from "../api/verifyEmail";

export function RegisterForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const navigate = useNavigate();
  const [registeredEmail, setRegisteredEmail] = React.useState<string | null>(null);
  const [otpCode, setOtpCode] = React.useState("");
  const [confirmError, setConfirmError] = React.useState<string | null>(null);
  const [cooldown, setCooldown] = React.useState(0);

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
      setOtpCode("");
      setConfirmError(null);
      setCooldown(60);
    },
  });

  const { mutateAsync: confirmRegisterMutation, isPending: isConfirmLoading } =
    useConfirmRegister();
  const { mutateAsync: resendEmailMutation, isPending: isResendLoading } =
    useVerifyEmail();

  React.useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleConfirm = async (codeToVerify?: string) => {
    const code = codeToVerify ?? otpCode;
    if (!registeredEmail || code.length !== 6) return;

    setConfirmError(null);
    try {
      await confirmRegisterMutation({ email: registeredEmail, code });
      toast.success("Account created and verified!");
      navigate("/");
    } catch (err) {
      if (isAxiosError(err)) {
        setConfirmError(
          err.response?.data?.message ||
            err.response?.data?.detail ||
            "Verification failed. Invalid or expired code.",
        );
      } else {
        setConfirmError("An unexpected error occurred. Please try again.");
      }
    }
  };

  const handleResend = async () => {
    if (cooldown > 0 || !registeredEmail) return;
    setConfirmError(null);
    try {
      await resendEmailMutation({ email: registeredEmail });
      toast.info("A new verification code has been sent to your email.");
      setCooldown(60);
    } catch (err) {
      if (isAxiosError(err)) {
        setConfirmError(
          err.response?.data?.message ||
            err.response?.data?.detail ||
            "Failed to resend verification code.",
        );
      }
    }
  };

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
          <div className="flex flex-col gap-6">
            <div className="flex flex-col items-center gap-2 text-center">
              <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Mail className="size-6" />
              </div>
              <h1 className="text-2xl font-bold font-heading text-foreground">
                Verify your email
              </h1>
              <p className="text-xs text-balance text-muted-foreground">
                We sent a 6-digit verification code to{" "}
                <span className="font-semibold text-foreground">
                  {registeredEmail}
                </span>
                . Enter the code below to complete your registration.
              </p>
            </div>

            {confirmError && (
              <FieldError className="rounded-md border border-destructive/20 bg-destructive/10 p-3 text-center text-xs">
                {confirmError}
              </FieldError>
            )}

            <div className="py-2 flex justify-center">
              <OtpInput
                value={otpCode}
                onChange={setOtpCode}
                onComplete={handleConfirm}
                hasError={Boolean(confirmError)}
                disabled={isConfirmLoading}
              />
            </div>

            <div className="flex flex-col gap-3">
              <Button
                type="button"
                onClick={() => handleConfirm()}
                disabled={isConfirmLoading || otpCode.length !== 6}
                className="w-full h-9 font-semibold text-xs cursor-pointer"
              >
                {isConfirmLoading ? "Verifying..." : "Complete Registration"}
              </Button>

              <div className="flex items-center justify-between text-xs pt-1">
                <button
                  type="button"
                  onClick={() => setRegisteredEmail(null)}
                  className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  <ArrowLeft className="size-3.5" />
                  Change email
                </button>

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={cooldown > 0 || isResendLoading}
                  onClick={handleResend}
                  className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground cursor-pointer font-normal"
                >
                  {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend code"}
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
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
                <FieldLabel htmlFor="password" className="text-xs font-semibold">
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
                footerActionTo="/login"
              />
            </FieldGroup>
          </form>
        )}
      </div>
    </div>
  );
}

export default RegisterForm;

