import * as React from "react";
import { Mail, Check } from "@/components/ui/icons";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field";
import { emailSchema } from "../schemas/authSchemas";
import { useForgotPassword } from "../api/forgotPassword";
import useCountdownTimer from "@/hooks/useCountdownTimer";
import { getErrorMessage } from "@/api/types";

export interface ForgotPasswordModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  email: string;
  autoSend?: boolean;
}

export function ForgotPasswordModal({
  open,
  onOpenChange,
  email,
  autoSend = false,
}: ForgotPasswordModalProps) {
  const [error, setError] = React.useState<string | null>(null);
  const [isSuccess, setIsSuccess] = React.useState(false);
  const hasAutoSentRef = React.useRef(false);

  const storageKey = email
    ? `auth_forgot_password_${email.trim().toLowerCase()}`
    : undefined;

  const {
    isActive: isTimerActive,
    timerTextRef,
    startTimer,
    resetTimer,
  } = useCountdownTimer({ defaultSeconds: 60, storageKey });

  const showSuccess = isSuccess || isTimerActive;

  const { mutateAsync: sendReset, isPending } = useForgotPassword();

  const handleOpenChange = React.useCallback(
    (isOpen: boolean) => {
      if (!isOpen) {
        setError(null);
        if (!isTimerActive) {
          setIsSuccess(false);
          resetTimer();
        }
        hasAutoSentRef.current = false;
      }
      onOpenChange(isOpen);
    },
    [isTimerActive, onOpenChange, resetTimer],
  );

  const handleSendResetEmail = React.useCallback(
    async (targetEmail: string) => {
      setError(null);
      const parseResult = emailSchema.safeParse(targetEmail);
      if (!parseResult.success) {
        setError(
          parseResult.error.issues[0]?.message ||
            "Please enter a valid email address",
        );
        return;
      }

      try {
        await sendReset({ email: targetEmail.trim() });
        setIsSuccess(true);
        startTimer(60);
      } catch (err) {
        setError(getErrorMessage(err, "Failed to send reset email."));
      }
    },
    [sendReset, startTimer],
  );

  React.useEffect(() => {
    if (!open) {
      hasAutoSentRef.current = false;
      return;
    }

    if (isTimerActive) {
      return;
    }

    if (autoSend && email && !hasAutoSentRef.current) {
      hasAutoSentRef.current = true;
      handleSendResetEmail(email);
    }
  }, [open, autoSend, email, isTimerActive, handleSendResetEmail]);

  const handleResend = async () => {
    if (isTimerActive || !email || isPending) return;
    await handleSendResetEmail(email);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            {showSuccess ? (
              <Check className="size-6 text-emerald-600" />
            ) : (
              <Mail className="size-6" />
            )}
          </div>
          <DialogTitle className="text-center text-xl font-bold font-heading">
            {showSuccess ? "Check your inbox" : "Reset your password"}
          </DialogTitle>
          <DialogDescription className="text-center text-xs text-muted-foreground text-balance">
            {showSuccess
              ? `If an account exists for ${email}, a password reset link has been sent with 15-minute validity.`
              : "We will send a password reset link to the email address associated with your account."}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <FieldError className="rounded-md border border-destructive/20 bg-destructive/10 p-3 text-center text-xs">
            {error}
          </FieldError>
        )}

        {showSuccess ? (
          <div className="flex flex-col gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              disabled={isTimerActive || isPending}
              onClick={handleResend}
              className="w-full text-xs h-9 cursor-pointer"
            >
              {isTimerActive ? (
                <>
                  Resend link in <span ref={timerTextRef}>60</span>s
                </>
              ) : isPending ? (
                "Sending..."
              ) : (
                "Resend reset link"
              )}
            </Button>
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
              disabled={isPending || !email.trim()}
              onClick={() => handleSendResetEmail(email)}
              className="w-full h-9 text-xs font-semibold cursor-pointer"
            >
              {isPending ? "Sending..." : "Send reset link"}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default ForgotPasswordModal;
