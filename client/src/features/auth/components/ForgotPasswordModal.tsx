import * as React from "react";
import { Mail, CheckCircle2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { emailSchema } from "../schemas/authSchemas";
import { useForgotPassword } from "../api/forgotPassword";
import useCountdownTimer from "@/hooks/useCountdownTimer";
import { getErrorMessage } from "@/api/types";

export interface ForgotPasswordModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialEmail?: string;
  autoSend?: boolean;
}

export function ForgotPasswordModal({
  open,
  onOpenChange,
  initialEmail = "",
  autoSend = false,
}: ForgotPasswordModalProps) {
  const [email, setEmail] = React.useState(initialEmail);
  const [error, setError] = React.useState<string | null>(null);
  const [isSuccess, setIsSuccess] = React.useState(false);

  const {
    isActive: isTimerActive,
    timerTextRef,
    startTimer,
    resetTimer,
  } = useCountdownTimer({ defaultSeconds: 60 });

  const { mutateAsync: sendReset, isPending } = useForgotPassword();

  const handleOpenChange = React.useCallback(
    (isOpen: boolean) => {
      if (!isOpen) {
        setEmail(initialEmail);
        setError(null);
        setIsSuccess(false);
        resetTimer();
      }
      onOpenChange(isOpen);
    },
    [initialEmail, onOpenChange, resetTimer],
  );

  const handleSendResetEmail = React.useCallback(
    async (emailToSend: string) => {
      setError(null);
      const parseResult = emailSchema.safeParse(emailToSend);
      if (!parseResult.success) {
        setError(
          parseResult.error.issues[0]?.message ||
            "Please enter a valid email address",
        );
        return;
      }

      try {
        await sendReset({ email: emailToSend.trim() });
        setIsSuccess(true);
        startTimer(60);
      } catch (err) {
        setError(getErrorMessage(err, "Failed to send reset email."));
      }
    },
    [sendReset, startTimer],
  );

  React.useEffect(() => {
    if (!open) return;

    if (autoSend && initialEmail) {
      sendReset({ email: initialEmail.trim() })
        .then(() => {
          setIsSuccess(true);
          startTimer(60);
        })
        .catch((err) => {
          setError(getErrorMessage(err, "Failed to send reset email."));
        });
    }
  }, [open, autoSend, initialEmail, sendReset, startTimer]);

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    await handleSendResetEmail(email || initialEmail);
  };

  const handleResend = async () => {
    const targetEmail = email || initialEmail;
    if (isTimerActive || !targetEmail) return;
    await handleSendResetEmail(targetEmail);
  };

  const currentEmail = email || initialEmail;

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
            {isSuccess ? "Check your inbox" : "Reset your password"}
          </DialogTitle>
          <DialogDescription className="text-center text-xs text-muted-foreground text-balance">
            {isSuccess
              ? `If an account exists for ${currentEmail}, a password reset link has been sent with 15-minute validity.`
              : "Enter the email associated with your account, and we will send you a password reset link."}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <FieldError className="rounded-md border border-destructive/20 bg-destructive/10 p-3 text-center text-xs">
            {error}
          </FieldError>
        )}

        {isSuccess ? (
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
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 pt-2">
            <FieldGroup>
              <Field data-invalid={Boolean(error)}>
                <FieldLabel
                  htmlFor="reset-email"
                  className="text-xs font-semibold"
                >
                  Email address
                </FieldLabel>
                <Input
                  id="reset-email"
                  type="email"
                  value={currentEmail}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john@example.com"
                  autoComplete="email"
                  className="h-9 text-xs"
                  autoFocus
                />
              </Field>

              <Field>
                <Button
                  type="submit"
                  disabled={isPending || !currentEmail.trim()}
                  className="w-full h-9 text-xs font-semibold cursor-pointer"
                >
                  {isPending ? "Sending..." : "Send reset link"}
                </Button>
              </Field>
            </FieldGroup>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default ForgotPasswordModal;
