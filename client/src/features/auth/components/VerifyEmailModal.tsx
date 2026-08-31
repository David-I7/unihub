import * as React from "react";
import { useNavigate } from "react-router";
import { Mail, CheckCircle2, ArrowLeft } from "@/components/ui/icons";
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
import { useConfirmRegister } from "../api/confirmRegister";
import useCountdownTimer from "@/hooks/useCountdownTimer";
import useAuthStore from "../store/useAuthStore";
import queryClient from "@/lib/queryClient";
import { getErrorMessage } from "@/api/types";

export interface VerifyEmailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  email: string;
  mode?: "verify" | "register";
  autoSend?: boolean;
  onSuccess?: () => void;
  onChangeEmail?: () => void;
}

export function VerifyEmailModal({
  open,
  onOpenChange,
  email,
  mode = "verify",
  autoSend = false,
  onSuccess,
  onChangeEmail,
}: VerifyEmailModalProps) {
  const navigate = useNavigate();
  const [otpCode, setOtpCode] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [isSuccess, setIsSuccess] = React.useState(false);

  const setEmailVerified = useAuthStore((state) => state.setEmailVerified);

  const {
    isActive: isTimerActive,
    timerTextRef,
    startTimer,
    resetTimer,
  } = useCountdownTimer({ defaultSeconds: 60 });

  const { mutateAsync: sendVerifyCode, isPending: isSendingCode } =
    useVerifyEmail();
  const { mutateAsync: confirmEmailMutation, isPending: isConfirmingEmail } =
    useConfirmEmail();
  const {
    mutateAsync: confirmRegisterMutation,
    isPending: isConfirmingRegister,
  } = useConfirmRegister();

  const isSubmitting = isConfirmingEmail || isConfirmingRegister;

  const handleOpenChange = React.useCallback(
    (isOpen: boolean) => {
      if (!isOpen) {
        setOtpCode("");
        setError(null);
        setIsSuccess(false);
        resetTimer();
      }
      onOpenChange(isOpen);
    },
    [onOpenChange, resetTimer],
  );

  const handleSendCode = React.useCallback(async () => {
    if (!email) return;
    setError(null);
    try {
      await sendVerifyCode({ email });
      startTimer(60);
    } catch (err) {
      getErrorMessage(err, "Failed to send verification code.");
    }
  }, [email, sendVerifyCode, startTimer]);

  React.useEffect(() => {
    if (!open) return;

    if (autoSend && email) {
      sendVerifyCode({ email })
        .then(() => {
          startTimer(60);
        })
        .catch((err) => {
          setError(getErrorMessage(err, "Failed to send verification code."));
        });
    }
  }, [open, autoSend, email, sendVerifyCode, startTimer]);

  const handleConfirm = async (codeToVerify?: string) => {
    const code = codeToVerify ?? otpCode;
    if (!email || code.length !== 6) return;

    setError(null);

    try {
      if (mode === "register") {
        await confirmRegisterMutation({ email, code });
        onSuccess?.();
        handleOpenChange(false);
        navigate("/");
      } else {
        await confirmEmailMutation({ email, code });
        setEmailVerified(true);
        queryClient.invalidateQueries({ queryKey: ["users", "me"] });
        setIsSuccess(true);
        onSuccess?.();
      }
    } catch (err) {
      setError(getErrorMessage(err, "Invalid verification code."));
    }
  };

  const isRegister = mode === "register";

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            {isSuccess ? (
              <CheckCircle2 className="size-6 text-emerald-600" />
            ) : (
              <Mail className="size-6" />
            )}
          </div>
          <DialogTitle className="text-center text-xl font-bold font-heading">
            {isSuccess
              ? "Email verified"
              : isRegister
                ? "Complete your registration"
                : "Verify your email"}
          </DialogTitle>
          <DialogDescription className="text-center text-xs text-muted-foreground text-balance">
            {isSuccess ? (
              "Your email address has been successfully verified. You now have full access to notifications and reminders."
            ) : isRegister ? (
              <>
                We sent a 6-digit verification code to{" "}
                <span className="font-semibold text-foreground">{email}</span>.
                Enter the code below to complete your registration.
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
        ) : (
          <div className="flex flex-col gap-4 pt-2">
            <div className="flex justify-center py-1">
              <OtpInput
                value={otpCode}
                onChange={setOtpCode}
                onComplete={handleConfirm}
                hasError={Boolean(error)}
                disabled={isSubmitting}
              />
            </div>

            <div className="flex flex-col gap-3">
              <Button
                type="button"
                onClick={() => handleConfirm()}
                disabled={isSubmitting || otpCode.length !== 6}
                className="w-full h-9 font-semibold text-xs cursor-pointer"
              >
                {isSubmitting
                  ? "Verifying..."
                  : isRegister
                    ? "Complete registration"
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
                  disabled={isTimerActive || isSendingCode}
                  onClick={handleSendCode}
                  className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground cursor-pointer font-normal"
                >
                  {isTimerActive ? (
                    <>
                      Resend in <span ref={timerTextRef}>60</span>s
                    </>
                  ) : isSendingCode ? (
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
