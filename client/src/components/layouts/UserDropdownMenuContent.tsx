import * as React from "react";
import { KeyRound, LogOut, Settings, AlertTriangle, MailCheck } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useLogout } from "@/features/auth/api/logout";
import { ForgotPasswordModal } from "@/features/auth/components/ForgotPasswordModal";
import { VerifyEmailModal } from "@/features/auth/components/VerifyEmailModal";
import { AccountSettingsModal } from "@/features/users/components/AccountSettingsModal";
import { getInitials } from "@/lib/utils";
import { ThemeSubMenu } from "./ThemeMenu";
import type { User } from "@/types/domain";

export interface UserDropdownMenuContentProps extends React.ComponentProps<typeof DropdownMenuContent> {
  user: User;
}

export function UserDropdownMenuContent({
  user,
  className = "min-w-60 rounded-lg p-2",
  ...props
}: UserDropdownMenuContentProps) {
  const [isAccountSettingsOpen, setIsAccountSettingsOpen] = React.useState(false);
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = React.useState(false);
  const [isVerifyEmailOpen, setIsVerifyEmailOpen] = React.useState(false);

  const { mutate: logout, status: logoutStatus } = useLogout();

  const isLoggingOut = logoutStatus === "pending";
  const initials = getInitials(user.username || user.email);

  return (
    <>
      <DropdownMenuContent className={className} {...props}>
        <DropdownMenuGroup>
          <DropdownMenuLabel className="p-0 font-normal">
            <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
              <Avatar className="h-8 w-8 rounded-lg shrink-0">
                <AvatarFallback className="rounded-lg bg-primary/15 text-primary font-semibold text-xs">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight min-w-0">
                <span className="truncate font-semibold">{user.username}</span>
                <div className="flex items-center gap-1 min-w-0">
                  <span className="truncate text-xs text-muted-foreground">
                    {user.email}
                  </span>
                  {!user.emailVerified && (
                    <button
                      type="button"
                      title="Email unverified - Click to verify"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsVerifyEmailOpen(true);
                      }}
                      className="inline-flex items-center text-amber-600 dark:text-amber-400 shrink-0 hover:underline cursor-pointer"
                    >
                      <AlertTriangle className="size-3" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </DropdownMenuLabel>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuItem
            onClick={() => setIsAccountSettingsOpen(true)}
            className="cursor-pointer"
          >
            <Settings className="mr-2 size-4" />
            <span>Account Settings</span>
          </DropdownMenuItem>

          {!user.emailVerified && (
            <DropdownMenuItem
              onClick={() => setIsVerifyEmailOpen(true)}
              className="cursor-pointer text-amber-600 dark:text-amber-400 focus:text-amber-700 dark:focus:text-amber-300"
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

        <DropdownMenuItem
          variant="destructive"
          disabled={isLoggingOut}
          onClick={() => logout()}
          className="cursor-pointer"
        >
          <LogOut className="mr-2 size-4" />
          <span>{isLoggingOut ? "Logging out..." : "Log out"}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>

      <AccountSettingsModal
        user={user}
        open={isAccountSettingsOpen}
        onOpenChange={setIsAccountSettingsOpen}
      />

      <ForgotPasswordModal
        open={isForgotPasswordOpen}
        onOpenChange={setIsForgotPasswordOpen}
        initialEmail={user.email}
        autoSend={true}
      />

      <VerifyEmailModal
        open={isVerifyEmailOpen}
        onOpenChange={setIsVerifyEmailOpen}
        email={user.email}
        mode="verify"
        autoSend={true}
      />
    </>
  );
}

export default UserDropdownMenuContent;
