import * as React from "react";
import { useNavigate } from "react-router";
import { Mail, ArrowLeft } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field";
import { OtpInput } from "@/components/ui/otp-input";
import { useConfirmRegister } from "../api/confirmRegister";
import { useResendRegisterCode } from "../api/resendRegisterCode";
import useCountdownTimer from "@/hooks/useCountdownTimer";
import { getErrorMessage } from "@/api/types";

export interface RegisterVerificationStepProps {
  email: string;
  onSuccess?: () => void;
}

export function RegisterVerificationStep({
  email,
  onSuccess,
}: RegisterVerificationStepProps) {
  const navigate = useNavigate();
  const [otpCode, setOtpCode] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const hasStartedTimerRef = React.useRef(false);

  const storageKey = email
    ? `auth_verify_email_${email.trim().toLowerCase()}`
    : undefined;

  const {
    isActive: isTimerActive,
    timerTextRef,
    startTimer,
    resetTimer,
  } = useCountdownTimer({ defaultSeconds: 60, storageKey });

  const {
    mutateAsync: confirmRegisterMutation,
    isPending: isConfirmingRegister,
  } = useConfirmRegister();

  const {
    mutateAsync: resendRegisterCodeMutation,
    isPending: isResendingCode,
  } = useResendRegisterCode();

  React.useEffect(() => {
    if (!isTimerActive && !hasStartedTimerRef.current) {
      hasStartedTimerRef.current = true;
      startTimer(60);
    }
  }, [isTimerActive, startTimer]);

  const handleConfirm = async (codeToVerify?: string) => {
    const code = codeToVerify ?? otpCode;
    if (!email || code.length !== 6) return;

    setError(null);

    try {
      await confirmRegisterMutation({ email, code });
      resetTimer();
      onSuccess?.();
      navigate("/");
    } catch (err) {
      setError(getErrorMessage(err, "Invalid verification code."));
    }
  };

  const handleResend = async () => {
    if (!email || isTimerActive || isResendingCode) return;
    setError(null);
    try {
      await resendRegisterCodeMutation({ email });
      startTimer(60);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to resend verification code."));
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-200">
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Mail className="size-6" />
        </div>
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold font-heading text-foreground">
            Complete your registration
          </h1>
          <p className="text-xs text-balance text-muted-foreground">
            We sent a 6-digit verification code to{" "}
            <span className="font-semibold text-foreground">{email}</span>.
            Enter the code below to complete your registration.
          </p>
        </div>
      </div>

      {error && (
        <FieldError className="rounded-md border border-destructive/20 bg-destructive/10 p-3 text-center text-xs">
          {error}
        </FieldError>
      )}

      <div className="flex flex-col gap-4">
        <div className="flex justify-center py-1">
          <OtpInput
            value={otpCode}
            onChange={setOtpCode}
            onComplete={handleConfirm}
            hasError={Boolean(error)}
            disabled={isConfirmingRegister || isResendingCode}
          />
        </div>

        <div className="flex flex-col gap-3">
          <Button
            type="button"
            onClick={() => handleConfirm()}
            disabled={
              isConfirmingRegister || isResendingCode || otpCode.length !== 6
            }
            className="w-full h-9 font-semibold text-xs cursor-pointer"
          >
            {isConfirmingRegister
              ? "Completing registration..."
              : isResendingCode
                ? "Sending code..."
                : "Complete registration"}
          </Button>

          <div className="flex items-center justify-end text-xs pt-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={isTimerActive || isResendingCode}
              onClick={handleResend}
              className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground cursor-pointer font-normal"
            >
              {isTimerActive ? (
                <>
                  Resend in <span ref={timerTextRef}>60</span>s
                </>
              ) : isResendingCode ? (
                "Sending code..."
              ) : (
                "Resend code"
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RegisterVerificationStep;
