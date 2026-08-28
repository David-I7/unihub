import { KeyRound, LogOut, User as UserIcon } from "lucide-react";
import { useNavigate } from "react-router";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useLogout } from "@/features/auth/api/logout";
import { getInitials } from "@/lib/utils";
import { ThemeSubMenu } from "./ThemeMenu";
import type { User } from "@/types/domain";

export interface UserDropdownMenuContentProps extends React.ComponentProps<typeof DropdownMenuContent> {
  user: User;
}

export function UserDropdownMenuContent({
  user,
  className = "min-w-56 rounded-lg p-2",
  ...props
}: UserDropdownMenuContentProps) {
  const navigate = useNavigate();
  const { mutate: logout, status: logoutStatus } = useLogout();
  const isLoggingOut = logoutStatus === "pending";
  const initials = getInitials(user.username || user.email);

  return (
    <DropdownMenuContent className={className} {...props}>
      <DropdownMenuGroup>
        <DropdownMenuLabel className="p-0 font-normal">
          <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
            <Avatar className="h-8 w-8 rounded-lg">
              <AvatarFallback className="rounded-lg bg-primary/15 text-primary font-semibold text-xs">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold">{user.username}</span>
              <span className="truncate text-xs text-muted-foreground">
                {user.email}
              </span>
            </div>
          </div>
        </DropdownMenuLabel>
      </DropdownMenuGroup>

      <DropdownMenuSeparator />

      <DropdownMenuGroup>
        <DropdownMenuItem
          onClick={() => navigate("/profile")}
          className="cursor-pointer"
        >
          <UserIcon className="mr-2 size-4" />
          <span>My Profile</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => navigate("/settings/password")}
          className="cursor-pointer"
        >
          <KeyRound className="mr-2 size-4" />
          <span>Change Password</span>
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
  );
}

export default UserDropdownMenuContent;
