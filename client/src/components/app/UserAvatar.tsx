import * as React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn, getInitials } from "@/lib/utils";

export type UserAvatarSize = "xs" | "sm" | "default" | "md" | "lg" | "xl";

export interface UserAvatarProps
  extends Omit<React.ComponentProps<typeof Avatar>, "size"> {
  username?: string | null;
  src?: string | null;
  size?: UserAvatarSize;
  fallbackClassName?: string;
}

const sizeClasses: Record<UserAvatarSize, { root: string; fallback: string; rounded: string }> = {
  xs: { root: "size-6", fallback: "text-[10px]", rounded: "rounded-lg" },
  sm: { root: "size-8", fallback: "text-xs", rounded: "rounded-xl" },
  default: { root: "size-8", fallback: "text-xs", rounded: "rounded-xl" },
  md: { root: "size-10", fallback: "text-sm", rounded: "rounded-xl" },
  lg: { root: "size-12", fallback: "text-base", rounded: "rounded-xl" },
  xl: { root: "size-16", fallback: "text-lg", rounded: "rounded-2xl" },
};

export function UserAvatar({
  username,
  src,
  size = "default",
  className,
  fallbackClassName,
  ...props
}: UserAvatarProps) {
  const initials = getInitials(username);
  const { root: sizeClass, fallback: textSizeClass, rounded } = sizeClasses[size] ?? sizeClasses.default;

  return (
    <Avatar
      className={cn(
        "border border-primary/20 bg-primary/10 shrink-0 select-none",
        rounded,
        sizeClass,
        className,
      )}
      {...props}
    >
      {src && (
        <AvatarImage
          src={src}
          alt={username ?? "User avatar"}
          className={cn("object-cover", rounded)}
        />
      )}
      <AvatarFallback
        className={cn(
          "bg-primary/10 text-primary font-heading font-semibold",
          rounded,
          textSizeClass,
          fallbackClassName,
        )}
      >
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}
