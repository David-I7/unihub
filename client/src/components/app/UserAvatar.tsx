import * as React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn, getInitials } from "@/lib/utils";

export interface UserAvatarProps extends React.ComponentProps<typeof Avatar> {
  username?: string | null;
  src?: string | null;
  size?: "default" | "sm" | "lg";
  fallbackClassName?: string;
}

export function UserAvatar({
  username,
  src,
  size = "default",
  className,
  fallbackClassName,
  ...props
}: UserAvatarProps) {
  const initials = getInitials(username);

  return (
    <Avatar
      size={size}
      className={cn(
        "rounded-xl border border-primary/20 bg-primary/10 shrink-0 select-none",
        className,
      )}
      {...props}
    >
      {src && (
        <AvatarImage
          src={src}
          alt={username ?? "User avatar"}
          className="rounded-xl object-cover"
        />
      )}
      <AvatarFallback
        className={cn(
          "rounded-xl bg-primary/10 text-primary font-heading font-semibold",
          fallbackClassName,
        )}
      >
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}
