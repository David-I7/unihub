import * as React from "react";
import { Mail, Check, ArrowLeft } from "@/components/ui/icons";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field";
import { OtpInput } from "@/components/ui/otp-input";
import { useVerifyEmail } from "../api/verifyEmail";
import { useConfirmEmail } from "../api/confirmEmail";
import { useResendEmailVerification } from "../api/resendEmailVerification";
import useCountdownTimer from "@/hooks/useCountdownTimer";
import useAuthStore from "../store/useAuthStore";
import queryClient from "@/lib/queryClient";
import { getErrorMessage } from "@/api/types";

export interface VerifyEmailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  email: string;
  onSuccess?: () => void;
  onChangeEmail?: () => void;
}

export function VerifyEmailModal({
  open,
  onOpenChange,
  email,
  onSuccess,
  onChangeEmail,
}: VerifyEmailModalProps) {
  const [otpCode, setOtpCode] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [isSuccess, setIsSuccess] = React.useState(false);
  const [codeSent, setCodeSent] = React.useState(false);

  const setEmailVerified = useAuthStore((state) => state.setEmailVerified);

  const storageKey = email
    ? `auth_verify_email_${email.trim().toLowerCase()}`
    : undefined;

  const {
    isActive: isTimerActive,
    timerTextRef,
    startTimer,
    resetTimer,
  } = useCountdownTimer({ defaultSeconds: 60, storageKey });

  const isCodeSent = isTimerActive || codeSent;

  const { mutateAsync: sendVerifyCode, isPending: isSendingCode } =
    useVerifyEmail();
  const { mutateAsync: resendEmailMutation, isPending: isResendingEmail } =
    useResendEmailVerification();

  const isResending = isResendingEmail;

  const { mutateAsync: confirmEmailMutation, isPending: isConfirmingEmail } =
    useConfirmEmail();

  const isSubmitting = isConfirmingEmail;

  const handleOpenChange = React.useCallback(
    (isOpen: boolean) => {
      if (!isOpen) {
        setOtpCode("");
        setError(null);
        setIsSuccess(false);
        if (!isTimerActive) {
          setCodeSent(false);
          resetTimer();
        }
      }
      onOpenChange(isOpen);
    },
    [isTimerActive, onOpenChange, resetTimer],
  );

  const handleSendCode = React.useCallback(async () => {
    if (!email) return;
    setError(null);
    try {
      await sendVerifyCode({ email });
      setCodeSent(true);
      startTimer(60);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to send verification code."));
    }
  }, [email, sendVerifyCode, startTimer]);

  const handleResendCode = React.useCallback(async () => {
    if (!email || isTimerActive || isResending || isSendingCode) return;
    setError(null);
    try {
      await resendEmailMutation({ email });

      setCodeSent(true);
      startTimer(60);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to resend verification code."));
    }
  }, [
    email,
    isTimerActive,
    isResending,
    isSendingCode,
    resendEmailMutation,
    startTimer,
  ]);

  const handleConfirm = async (codeToVerify?: string) => {
    const code = codeToVerify ?? otpCode;
    if (!email || code.length !== 6) return;

    setError(null);

    try {
      await confirmEmailMutation({ email, code });
      resetTimer();
      setEmailVerified(true);
      queryClient.invalidateQueries({ queryKey: ["users", "me"] });
      setIsSuccess(true);
      onSuccess?.();
    } catch (err) {
      setError(getErrorMessage(err, "Invalid verification code."));
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            {isSuccess ? (
              <Check className="size-6 text-emerald-600" />
            ) : (
              <Mail className="size-6" />
            )}
          </div>
          <DialogTitle className="text-center text-xl font-bold font-heading">
            {isSuccess ? "Email verified" : "Verify your email"}
          </DialogTitle>
          <DialogDescription className="text-center text-xs text-muted-foreground text-balance">
            {isSuccess ? (
              "Your email address has been successfully verified. You now have full access to notifications and reminders."
            ) : !isCodeSent ? (
              "We will send a 6-digit verification code to the email address associated with your account."
            ) : isSendingCode ? (
              <>
                Sending verification code to{" "}
                <span className="font-semibold text-foreground">{email}</span>
                ...
              </>
            ) : (
              <>
                Enter the 6-digit verification code sent to{" "}
                <span className="font-semibold text-foreground">{email}</span>{" "}
                to verify your account.
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <FieldError className="rounded-md border border-destructive/20 bg-destructive/10 p-3 text-center text-xs">
            {error}
          </FieldError>
        )}

        {isSuccess ? (
          <div className="pt-2">
            <Button
              type="button"
              onClick={() => handleOpenChange(false)}
              className="w-full text-xs h-9 cursor-pointer"
            >
              Done
            </Button>
          </div>
        ) : !isCodeSent ? (
          <div className="flex flex-col gap-4 pt-2">
            <div className="flex items-center gap-2.5 rounded-lg border bg-muted/40 px-3 py-2.5 text-xs">
              <Mail className="size-4 text-muted-foreground shrink-0" />
              <div className="flex flex-col min-w-0">
                <span className="text-[11px] font-medium text-muted-foreground">
                  Email address
                </span>
                <span className="font-semibold text-foreground truncate">
                  {email}
                </span>
              </div>
            </div>

            <Button
              type="button"
              disabled={isSendingCode || !email.trim()}
              onClick={handleSendCode}
              className="w-full h-9 font-semibold text-xs cursor-pointer"
            >
              {isSendingCode ? "Sending code..." : "Send verification code"}
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-4 pt-2">
            <div className="flex justify-center py-1">
              <OtpInput
                value={otpCode}
                onChange={setOtpCode}
                onComplete={handleConfirm}
                hasError={Boolean(error)}
                disabled={isSubmitting || isSendingCode}
              />
            </div>

            <div className="flex flex-col gap-3">
              <Button
                type="button"
                onClick={() => handleConfirm()}
                disabled={isSubmitting || isSendingCode || otpCode.length !== 6}
                className="w-full h-9 font-semibold text-xs cursor-pointer"
              >
                {isSubmitting
                  ? "Verifying..."
                  : isSendingCode
                    ? "Sending code..."
                    : "Confirm code"}
              </Button>

              <div className="flex items-center justify-between text-xs pt-1">
                {onChangeEmail ? (
                  <button
                    type="button"
                    onClick={() => {
                      handleOpenChange(false);
                      onChangeEmail();
                    }}
                    className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                  >
                    <ArrowLeft className="size-3.5" />
                    Change email
                  </button>
                ) : (
                  <span />
                )}

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={isTimerActive || isSendingCode || isResending}
                  onClick={handleResendCode}
                  className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground cursor-pointer font-normal"
                >
                  {isTimerActive ? (
                    <>
                      Resend in <span ref={timerTextRef}></span>s
                    </>
                  ) : isSendingCode || isResending ? (
                    "Sending code..."
                  ) : (
                    "Resend code"
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default VerifyEmailModal;
