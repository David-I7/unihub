import { Crown, ShieldCheck, User } from "@/components/ui/icons";
import { Badge, type badgeVariants } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { VariantProps } from "class-variance-authority";

export type AppRole =
  | "COMMUNITY_OWNER"
  | "COMMUNITY_ADMIN"
  | "COMMUNITY_MEMBER"
  | "OWNER"
  | "ROOT"
  | "ADMIN"
  | "USER"
  | "MEMBER"
  | string;

interface RoleBadgeProps {
  role?: AppRole | null;
  size?: VariantProps<typeof badgeVariants>["size"];
  className?: string;
  showIcon?: boolean;
}

export function RoleBadge({
  role,
  size = "sm",
  className,
  showIcon = true,
}: RoleBadgeProps) {
  if (!role) return null;

  const normalized = role.toUpperCase();

  if (normalized === "COMMUNITY_OWNER" || normalized === "OWNER") {
    return (
      <Badge
        variant="warning"
        size={size}
        className={cn("font-semibold gap-1", className)}
      >
        {showIcon && <Crown className="size-3 text-amber-500" />}
        Owner
      </Badge>
    );
  }

  if (
    normalized === "COMMUNITY_ADMIN" ||
    normalized === "ADMIN" ||
    normalized === "ROOT"
  ) {
    const label = normalized === "ROOT" ? "Root" : "Admin";
    return (
      <Badge
        variant="info"
        size={size}
        className={cn("font-semibold gap-1", className)}
      >
        {showIcon && <ShieldCheck className="size-3 text-blue-500" />}
        {label}
      </Badge>
    );
  }

  return (
    <Badge
      variant="secondary"
      size={size}
      className={cn("font-medium gap-1 text-foreground", className)}
    >
      {showIcon && <User className="size-3 text-foreground" />}
      Member
    </Badge>
  );
}
