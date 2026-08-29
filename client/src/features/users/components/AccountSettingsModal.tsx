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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
import type { User } from "@/types/domain";
import { useUserProfile } from "../api/getUserProfile";
import { useDeleteAccount } from "../api/deleteAccount";
import { VerifyEmailModal } from "@/features/auth/components/VerifyEmailModal";
import { ForgotPasswordModal } from "@/features/auth/components/ForgotPasswordModal";

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

  // Dialog states for email actions
  const [isVerifyEmailModalOpen, setIsVerifyEmailModalOpen] = React.useState(false);
  const [isForgotPasswordModalOpen, setIsForgotPasswordModalOpen] = React.useState(false);

  // Delete account state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [deleteError, setDeleteError] = React.useState<string | null>(null);

  const { mutateAsync: deleteAccountMutation, isPending: isDeletingAccount } =
    useDeleteAccount();

  const isEmailVerified = Boolean(user.emailVerified ?? profile?.emailVerified);
  const initials = getInitials(user.username || user.email);

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setIsDeleteDialogOpen(false);
      setDeleteError(null);
    }
    onOpenChange(isOpen);
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

              {!isEmailVerified && (
                <div className="flex flex-col gap-2 pt-1">
                  <p className="text-xs text-muted-foreground">
                    Your email is unverified. Verify your email to receive calendar reminders and notices.
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsVerifyEmailModalOpen(true)}
                    className="w-fit h-8 text-xs cursor-pointer font-medium"
                  >
                    Verify Email
                  </Button>
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
                onClick={() => setIsForgotPasswordModalOpen(true)}
                className="h-8 text-xs cursor-pointer font-medium"
              >
                Reset Password
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

      {/* Email Verification Modal */}
      <VerifyEmailModal
        open={isVerifyEmailModalOpen}
        onOpenChange={setIsVerifyEmailModalOpen}
        email={user.email}
        mode="verify"
        autoSend={true}
      />

      {/* Password Reset Modal */}
      <ForgotPasswordModal
        open={isForgotPasswordModalOpen}
        onOpenChange={setIsForgotPasswordModalOpen}
        initialEmail={user.email}
        autoSend={true}
      />

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
