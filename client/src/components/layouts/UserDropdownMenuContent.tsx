import * as React from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { isAxiosError } from "axios";
import {
  LogOut,
  KeyRound,
  AlertTriangle,
  MailCheck,
  ShieldCheck,
  Trash2,
} from "@/components/ui/icons";
import { UserAvatar } from "@/components/app/UserAvatar";
import { RoleBadge } from "@/components/app/RoleBadge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { FieldError } from "@/components/ui/field";
import {
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useLogout } from "@/features/auth/api/logout";
import { VerifyEmailModal } from "@/features/auth/components/VerifyEmailModal";
import { ForgotPasswordModal } from "@/features/auth/components/ForgotPasswordModal";
import { useDeleteAccount } from "@/features/users/api/deleteAccount";
import { ThemeSubMenu } from "./ThemeMenu";
import type { User } from "@/types/domain";

export interface UserDropdownMenuContentProps
  extends React.ComponentProps<typeof DropdownMenuContent> {
  user: User;
}

export function UserDropdownMenuContent({
  user,
  className = "min-w-64 rounded-xl p-2",
  ...props
}: UserDropdownMenuContentProps) {
  const navigate = useNavigate();
  const [isVerifyEmailOpen, setIsVerifyEmailOpen] = React.useState(false);
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = React.useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [deleteError, setDeleteError] = React.useState<string | null>(null);

  const { mutate: logout, status: logoutStatus } = useLogout();
  const { mutateAsync: deleteAccountMutation, isPending: isDeletingAccount } =
    useDeleteAccount();

  const isLoggingOut = logoutStatus === "pending";
  const isEmailVerified = Boolean(user.emailVerified);

  const handleDeleteAccount = async () => {
    setDeleteError(null);
    try {
      await deleteAccountMutation();
      toast.success("Your account has been deleted.");
      setIsDeleteDialogOpen(false);
      navigate("/login");
    } catch (err: unknown) {
      if (isAxiosError(err)) {
        const message =
          err.response?.data?.message ||
          "Failed to delete account. Please ensure you are not the sole owner of active communities.";
        setDeleteError(message);
      } else {
        setDeleteError("An unexpected error occurred. Please try again.");
      }
    }
  };

  return (
    <>
      <DropdownMenuContent className={className} {...props}>
        {/* User Identity & Global Role Header */}
        <DropdownMenuGroup>
          <DropdownMenuLabel className="p-1 font-normal">
            <div className="flex items-start gap-2.5 px-1 py-1.5 text-left text-sm">
              <UserAvatar
                username={user.username || user.email}
                size="sm"
                className="rounded-lg shrink-0 mt-0.5"
                fallbackClassName="rounded-lg"
              />
              <div className="grid flex-1 text-left text-sm leading-tight min-w-0">
                <span className="truncate font-semibold text-foreground">
                  {user.username}
                </span>
                <span className="truncate text-xs text-muted-foreground">
                  {user.email}
                </span>

                {/* Global Role & Verification Badge below profile info */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1.5">
                  <RoleBadge role={user.role} size="xs" />
                  {isEmailVerified ? (
                    <Badge
                      variant="verified"
                      size="xs"
                      className="font-medium gap-1 text-[10px]"
                    >
                      <ShieldCheck className="size-3 text-emerald-500" />
                      Verified
                    </Badge>
                  ) : (
                    <Badge
                      variant="warning"
                      size="xs"
                      className="font-medium gap-1 text-[10px]"
                    >
                      <AlertTriangle className="size-3" />
                      Unverified
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </DropdownMenuLabel>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        {/* Action Group */}
        <DropdownMenuGroup>
          {!isEmailVerified && (
            <DropdownMenuItem
              onClick={() => setIsVerifyEmailOpen(true)}
              className="cursor-pointer text-amber-600 dark:text-amber-400 focus:text-amber-700 dark:focus:text-amber-300 font-medium"
            >
              <MailCheck className="mr-2 size-4" />
              <span>Verify Email</span>
            </DropdownMenuItem>
          )}

          <DropdownMenuItem
            onClick={() => setIsForgotPasswordOpen(true)}
            className="cursor-pointer"
          >
            <KeyRound className="mr-2 size-4" />
            <span>Reset Password</span>
          </DropdownMenuItem>

          <ThemeSubMenu />
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        {/* Danger Actions: Delete Account & Log out */}
        <DropdownMenuGroup>
          <DropdownMenuItem
            variant="destructive"
            onClick={() => setIsDeleteDialogOpen(true)}
            className="cursor-pointer text-destructive focus:text-destructive"
          >
            <Trash2 className="mr-2 size-4" />
            <span>Delete Account</span>
          </DropdownMenuItem>

          <DropdownMenuItem
            variant="destructive"
            disabled={isLoggingOut}
            onClick={() => logout()}
            className="cursor-pointer"
          >
            <LogOut className="mr-2 size-4" />
            <span>{isLoggingOut ? "Logging out..." : "Log out"}</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>

      {/* Verify Email Modal (autoSend = false) */}
      <VerifyEmailModal
        open={isVerifyEmailOpen}
        onOpenChange={setIsVerifyEmailOpen}
        email={user.email}
        mode="verify"
        autoSend={false}
      />

      {/* Reset Password Modal (autoSend = false) */}
      <ForgotPasswordModal
        open={isForgotPasswordOpen}
        onOpenChange={setIsForgotPasswordOpen}
        initialEmail={user.email}
        autoSend={false}
      />

      {/* Delete Account Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
              <AlertTriangle className="size-6" />
            </div>
            <DialogTitle className="text-center text-lg font-bold font-heading">
              Delete your account?
            </DialogTitle>
            <DialogDescription className="text-center text-xs text-muted-foreground text-balance">
              This action is permanent and cannot be undone. All your personal
              data, memberships, comments, and reminders will be deleted.
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
              className="w-full sm:w-auto text-xs h-9 cursor-pointer font-semibold gap-1.5"
            >
              <Trash2 className="size-3.5" />
              <span>
                {isDeletingAccount ? "Deleting..." : "Yes, delete my account"}
              </span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default UserDropdownMenuContent;
