import * as React from "react";
import { isAxiosError } from "axios";
import { Mail, CheckCircle2, ArrowLeft } from "lucide-react";
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

export interface ForgotPasswordModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ForgotPasswordModal({
  open,
  onOpenChange,
}: ForgotPasswordModalProps) {
  const [email, setEmail] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [isSuccess, setIsSuccess] = React.useState(false);
  const [cooldown, setCooldown] = React.useState(0);

  const { mutateAsync: sendReset, isPending } = useForgotPassword();

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setEmail("");
      setError(null);
      setIsSuccess(false);
      setCooldown(0);
    }
    onOpenChange(isOpen);
  };

  React.useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const parseResult = emailSchema.safeParse(email);
    if (!parseResult.success) {
      setError(
        parseResult.error.issues[0]?.message ||
          "Please enter a valid email address",
      );
      return;
    }

    try {
      await sendReset({ email: email.trim() });
      setIsSuccess(true);
      setCooldown(60);
    } catch (err) {
      if (isAxiosError(err)) {
        setError(
          err.response?.data?.message ||
            err.response?.data?.detail ||
            "Failed to send reset email.",
        );
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    }
  };

  const handleResend = async () => {
    if (cooldown > 0 || !email) return;
    setError(null);
    try {
      await sendReset({ email: email.trim() });
      setCooldown(60);
    } catch (err) {
      if (isAxiosError(err)) {
        setError(
          err.response?.data?.message ||
            err.response?.data?.detail ||
            "Failed to resend reset email.",
        );
      }
    }
  };

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
              ? `If an account exists for ${email}, a password reset link has been sent with 15-minute validity.`
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
              disabled={cooldown > 0 || isPending}
              onClick={handleResend}
              className="w-full text-xs h-9 cursor-pointer"
            >
              {cooldown > 0
                ? `Resend link in ${cooldown}s`
                : "Resend reset link"}
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
                  value={email}
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
                  disabled={isPending || !email.trim()}
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
