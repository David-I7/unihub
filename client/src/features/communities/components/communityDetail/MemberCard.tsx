import { useState } from "react";
import {
  MoreVertical,
  ShieldCheck,
  User,
  Crown,
  Calendar,
  UserMinus,
  UserCog,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/app/UserAvatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { useAuthStore } from "@/features/auth";
import { usePermissions } from "@/hooks/usePermissions";
import { RemoveMemberDialog } from "./RemoveMemberDialog";
import { ChangeMemberRoleModal } from "./ChangeMemberRoleModal";
import type { CommunityMember, CallerMembership } from "../../api/types";

interface MemberCardProps {
  member: CommunityMember;
  communitySlug: string;
  callerMembership?: CallerMembership | null;
}

export function MemberCard({
  member,
  communitySlug,
  callerMembership,
}: MemberCardProps) {
  const [changeRoleOpen, setChangeRoleOpen] = useState(false);
  const [removeOpen, setRemoveOpen] = useState(false);

  const user = useAuthStore((state) => state.user);
  const {
    isOwner,
    canRemoveMember,
    canUpdateMemberRole,
    globalPermissions,
  } = usePermissions(callerMembership);

  const isPlatformAdmin =
    globalPermissions.includes("ADMIN") ||
    globalPermissions.includes("ROOT") ||
    user?.role === "ADMIN" ||
    user?.role === "ROOT";

  const isSelf = user?.username === member.username;
  const isTargetOwner = member.role === "COMMUNITY_OWNER";
  const isTargetAdmin = member.role === "COMMUNITY_ADMIN";

  const canEditRole =
    canUpdateMemberRole && !isTargetOwner && (isOwner || isPlatformAdmin);

  const canRemove =
    canRemoveMember &&
    !isTargetOwner &&
    !isSelf &&
    (!isTargetAdmin || isOwner || isPlatformAdmin);

  const hasAnyActions = canEditRole || canRemove;

  const formattedJoinedDate = member.joinedAt
    ? new Date(member.joinedAt).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : null;

  return (
    <>
      <Card className="rounded-2xl border bg-card p-4 sm:p-5 shadow-xs hover:border-primary/40 transition-colors flex flex-col justify-between space-y-3.5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <UserAvatar
              username={member.username}
              className="size-11 rounded-xl text-sm font-bold ring-1 ring-border shrink-0"
              fallbackClassName="rounded-xl"
            />
            <div className="space-y-0.5 min-w-0 flex-1">
              <div className="flex items-center gap-1.5 min-w-0">
                <h3 className="font-heading text-sm font-bold text-foreground truncate">
                  @{member.username}
                </h3>
                {isSelf && (
                  <span className="text-[10px] text-muted-foreground font-medium shrink-0">
                    (You)
                  </span>
                )}
              </div>
              {member.email && (
                <p className="text-xs text-muted-foreground truncate">
                  {member.email}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {/* Role Badge */}
            {member.role === "COMMUNITY_OWNER" ? (
              <Badge
                variant="outline"
                className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 font-semibold gap-1 text-[11px] px-2 py-0.5"
              >
                <Crown className="size-3 text-amber-500" />
                Owner
              </Badge>
            ) : member.role === "COMMUNITY_ADMIN" ? (
              <Badge
                variant="outline"
                className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20 font-semibold gap-1 text-[11px] px-2 py-0.5"
              >
                <ShieldCheck className="size-3 text-blue-500" />
                Admin
              </Badge>
            ) : (
              <Badge
                variant="secondary"
                className="bg-muted text-muted-foreground font-medium gap-1 text-[11px] px-2 py-0.5"
              >
                <User className="size-3 text-muted-foreground" />
                Member
              </Badge>
            )}

            {/* Actions Menu */}
            {hasAnyActions && (
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      className="size-7 text-muted-foreground hover:text-foreground cursor-pointer rounded-lg ml-0.5"
                      title="Member actions"
                    />
                  }
                >
                  <MoreVertical className="size-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                  {canEditRole && (
                    <DropdownMenuItem
                      onClick={() => setChangeRoleOpen(true)}
                      className="gap-2 cursor-pointer text-xs"
                    >
                      <UserCog className="size-3.5" />
                      <span>Change Role</span>
                    </DropdownMenuItem>
                  )}
                  {canRemove && (
                    <DropdownMenuItem
                      variant="destructive"
                      onClick={() => setRemoveOpen(true)}
                      className="gap-2 cursor-pointer text-xs"
                    >
                      <UserMinus className="size-3.5" />
                      <span>Remove Member</span>
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>

        {/* Footer with joined date */}
        <div className="pt-2.5 border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5 text-[11px]">
            <Calendar className="size-3 text-muted-foreground/70" />
            <span>Joined {formattedJoinedDate ?? "recently"}</span>
          </span>
        </div>
      </Card>

      {/* Action Dialogs */}
      <ChangeMemberRoleModal
        member={member}
        communitySlug={communitySlug}
        open={changeRoleOpen}
        onOpenChange={setChangeRoleOpen}
      />

      <RemoveMemberDialog
        member={member}
        communitySlug={communitySlug}
        open={removeOpen}
        onOpenChange={setRemoveOpen}
      />
    </>
  );
}
