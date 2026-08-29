import * as React from "react";
import { useNavigate } from "react-router";
import { isAxiosError } from "axios";
import { toast } from "sonner";
import {
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Mail,
  KeyRound,
  Trash2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FieldError } from "@/components/ui/field";
import { OtpInput } from "@/components/ui/otp-input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
import type { User } from "@/types/domain";
import { useUserProfile } from "../api/getUserProfile";
import { useDeleteAccount } from "../api/deleteAccount";
import { useVerifyEmail } from "@/features/auth/api/verifyEmail";
import { useConfirmEmail } from "@/features/auth/api/confirmEmail";
import { useForgotPassword } from "@/features/auth/api/forgotPassword";
import useAuthStore from "@/features/auth/store/useAuthStore";
import queryClient from "@/lib/queryClient";

export interface AccountSettingsModalProps {
  user: User;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AccountSettingsModal({
  user,
  open,
  onOpenChange,
}: AccountSettingsModalProps) {
  const navigate = useNavigate();
  const { data: profile } = useUserProfile({ enabled: open });
  const setEmailVerified = useAuthStore((state) => state.setEmailVerified);

  // Email verification state
  const [isVerifyingEmail, setIsVerifyingEmail] = React.useState(false);
  const [otpCode, setOtpCode] = React.useState("");
  const [verifyError, setVerifyError] = React.useState<string | null>(null);
  const [cooldown, setCooldown] = React.useState(0);

  // Delete account state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [deleteError, setDeleteError] = React.useState<string | null>(null);

  // Reset password state
  const [isResetPasswordPending, setIsResetPasswordPending] = React.useState(false);

  const { mutateAsync: requestEmailVerification, isPending: isRequestingVerification } =
    useVerifyEmail();
  const { mutateAsync: confirmEmailMutation, isPending: isConfirmingEmail } =
    useConfirmEmail();
  const { mutateAsync: deleteAccountMutation, isPending: isDeletingAccount } =
    useDeleteAccount();
  const { mutateAsync: forgotPasswordMutation } = useForgotPassword();

  const isEmailVerified = Boolean(user.emailVerified ?? profile?.emailVerified);
  const initials = getInitials(user.username || user.email);

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setIsVerifyingEmail(false);
      setOtpCode("");
      setVerifyError(null);
      setIsDeleteDialogOpen(false);
      setDeleteError(null);
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

  const handleStartEmailVerification = async () => {
    setVerifyError(null);
    try {
      await requestEmailVerification({ email: user.email });
      setIsVerifyingEmail(true);
      setCooldown(60);
      toast.info("Verification code sent to your email.");
    } catch (err) {
      if (isAxiosError(err)) {
        setVerifyError(
          err.response?.data?.message ||
            err.response?.data?.detail ||
            "Failed to send verification code.",
        );
      }
    }
  };

  const handleConfirmEmailVerification = async (codeToVerify?: string) => {
    const code = codeToVerify ?? otpCode;
    if (code.length !== 6) return;

    setVerifyError(null);
    try {
      await confirmEmailMutation({ email: user.email, code });
      setEmailVerified(true);
      queryClient.invalidateQueries({ queryKey: ["users", "me"] });
      setIsVerifyingEmail(false);
      toast.success("Email verified successfully!");
    } catch (err) {
      if (isAxiosError(err)) {
        setVerifyError(
          err.response?.data?.message ||
            err.response?.data?.detail ||
            "Invalid or expired verification code.",
        );
      } else {
        setVerifyError("An unexpected error occurred. Please try again.");
      }
    }
  };

  const handleSendResetPassword = async () => {
    setIsResetPasswordPending(true);
    try {
      await forgotPasswordMutation({ email: user.email });
      toast.success("Password reset link sent to your email.");
    } catch (err) {
      if (isAxiosError(err)) {
        toast.error(
          err.response?.data?.message ||
            err.response?.data?.detail ||
            "Failed to send password reset email.",
        );
      } else {
        toast.error("Failed to send password reset email.");
      }
    } finally {
      setIsResetPasswordPending(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleteError(null);
    try {
      await deleteAccountMutation();
      toast.info("Your account has been deleted. A farewell email was sent.");
      handleOpenChange(false);
      navigate("/login");
    } catch (err) {
      if (isAxiosError(err)) {
        setDeleteError(
          err.response?.data?.message ||
            err.response?.data?.detail ||
            "Failed to delete account.",
        );
      } else {
        setDeleteError("An unexpected error occurred.");
      }
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold font-heading">
              Account Settings
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Manage your personal information, email verification, and account security.
            </DialogDescription>
          </DialogHeader>

          {/* Profile Overview */}
          <div className="flex items-center gap-3 p-3 rounded-xl border bg-muted/30">
            <Avatar className="size-12 rounded-xl">
              <AvatarFallback className="rounded-xl bg-primary/15 text-primary font-semibold text-sm">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 leading-tight">
              <span className="font-semibold text-sm text-foreground">
                {user.username}
              </span>
              <span className="text-xs text-muted-foreground">{user.email}</span>
            </div>
            {profile?.role && (
              <Badge variant="secondary" className="text-xs capitalize font-medium">
                {profile.role.toLowerCase()}
              </Badge>
            )}
          </div>

          <div className="flex flex-col gap-4 py-2">
            {/* Email Verification Section */}
            <div className="flex flex-col gap-2 rounded-xl border p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Mail className="size-4 text-muted-foreground" />
                  <span className="text-xs font-semibold text-foreground">
                    Email Verification
                  </span>
                </div>
                {isEmailVerified ? (
                  <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/20 gap-1 text-xs">
                    <CheckCircle2 className="size-3" />
                    Verified
                  </Badge>
                ) : (
                  <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/20 gap-1 text-xs">
                    <AlertTriangle className="size-3" />
                    Unverified
                  </Badge>
                )}
              </div>

              {!isEmailVerified && !isVerifyingEmail && (
                <div className="flex flex-col gap-2 pt-1">
                  <p className="text-xs text-muted-foreground">
                    Your email is unverified. Verify your email to receive calendar reminders and notices.
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isRequestingVerification}
                    onClick={handleStartEmailVerification}
                    className="w-fit h-8 text-xs cursor-pointer font-medium"
                  >
                    {isRequestingVerification ? "Sending code..." : "Verify Email"}
                  </Button>
                </div>
              )}

              {!isEmailVerified && isVerifyingEmail && (
                <div className="flex flex-col gap-3 pt-2">
                  <p className="text-xs text-muted-foreground">
                    Enter the 6-digit code sent to <span className="font-semibold text-foreground">{user.email}</span>:
                  </p>

                  {verifyError && (
                    <FieldError className="rounded-md border border-destructive/20 bg-destructive/10 p-2 text-center text-xs">
                      {verifyError}
                    </FieldError>
                  )}

                  <div className="flex justify-center py-1">
                    <OtpInput
                      value={otpCode}
                      onChange={setOtpCode}
                      onComplete={handleConfirmEmailVerification}
                      hasError={Boolean(verifyError)}
                      disabled={isConfirmingEmail}
                    />
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      disabled={cooldown > 0 || isRequestingVerification}
                      onClick={handleStartEmailVerification}
                      className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground cursor-pointer font-normal"
                    >
                      {cooldown > 0 ? `Resend code in ${cooldown}s` : "Resend code"}
                    </Button>

                    <Button
                      type="button"
                      size="sm"
                      disabled={isConfirmingEmail || otpCode.length !== 6}
                      onClick={() => handleConfirmEmailVerification()}
                      className="h-8 text-xs font-semibold cursor-pointer"
                    >
                      {isConfirmingEmail ? "Verifying..." : "Confirm Code"}
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Password Reset Section */}
            <div className="flex items-center justify-between rounded-xl border p-4">
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-2">
                  <KeyRound className="size-4 text-muted-foreground" />
                  <span className="text-xs font-semibold text-foreground">
                    Password Security
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Send a password reset link to your email.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isResetPasswordPending}
                onClick={handleSendResetPassword}
                className="h-8 text-xs cursor-pointer font-medium"
              >
                {isResetPasswordPending ? "Sending..." : "Reset Password"}
              </Button>
            </div>

            {/* Danger Zone: Account Deletion */}
            <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 flex flex-col gap-2">
              <div className="flex items-center gap-2 text-destructive">
                <ShieldAlert className="size-4" />
                <span className="text-xs font-semibold">Danger Zone</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Permanently delete your account and all associated personal data.
              </p>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() => setIsDeleteDialogOpen(true)}
                className="w-fit h-8 text-xs cursor-pointer font-medium mt-1"
              >
                <Trash2 className="size-3.5 mr-1" />
                Delete Account
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Self-Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
              <AlertTriangle className="size-6" />
            </div>
            <DialogTitle className="text-center text-lg font-bold font-heading">
              Delete your account?
            </DialogTitle>
            <DialogDescription className="text-center text-xs text-muted-foreground text-balance">
              This action is permanent and cannot be undone. All your memberships, comments, and reminders will be removed.
            </DialogDescription>
          </DialogHeader>

          {deleteError && (
            <FieldError className="rounded-md border border-destructive/20 bg-destructive/10 p-3 text-center text-xs">
              {deleteError}
            </FieldError>
          )}

          <DialogFooter className="flex-col sm:flex-row gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              className="w-full sm:w-auto text-xs h-9 cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={isDeletingAccount}
              onClick={handleDeleteAccount}
              className="w-full sm:w-auto text-xs h-9 cursor-pointer font-semibold"
            >
              {isDeletingAccount ? "Deleting..." : "Yes, delete my account"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default AccountSettingsModal;
