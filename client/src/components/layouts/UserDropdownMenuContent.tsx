import * as React from "react";
import { KeyRound, LogOut, Settings, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { isAxiosError } from "axios";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useLogout } from "@/features/auth/api/logout";
import { useForgotPassword } from "@/features/auth/api/forgotPassword";
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
  const [isSendingReset, setIsSendingReset] = React.useState(false);

  const { mutate: logout, status: logoutStatus } = useLogout();
  const { mutateAsync: sendResetPassword } = useForgotPassword();

  const isLoggingOut = logoutStatus === "pending";
  const initials = getInitials(user.username || user.email);

  const handleResetPassword = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsSendingReset(true);
    try {
      await sendResetPassword({ email: user.email });
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
      setIsSendingReset(false);
    }
  };

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
                    <span
                      title="Email unverified"
                      className="inline-flex items-center text-amber-600 dark:text-amber-400 shrink-0"
                    >
                      <AlertTriangle className="size-3" />
                    </span>
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
          <DropdownMenuItem
            disabled={isSendingReset}
            onClick={handleResetPassword}
            className="cursor-pointer"
          >
            <KeyRound className="mr-2 size-4" />
            <span>{isSendingReset ? "Sending Link..." : "Reset Password"}</span>
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
    </>
  );
}

export default UserDropdownMenuContent;

