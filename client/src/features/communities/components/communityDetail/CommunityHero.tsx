import { useState } from "react";
import {
  ShieldCheck,
  ShieldAlert,
  MoreVertical,
  Settings,
  KeyRound,
  Trash2,
  Users,
  GraduationCap,
  BookOpen,
  Award,
  Crown,
} from "@/components/ui/icons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/app/UserAvatar";
import { RoleBadge } from "@/components/app/RoleBadge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { computeThemeGradient } from "@/lib/gradientUtils";
import { useThemeStore } from "@/store/useThemeStore";
import { AppBreadcrumb } from "@/components/app/AppBreadcrumb";
import { usePermissions } from "@/hooks/usePermissions";
import { CommunitySettingsModal } from "../CommunitySettingsModal";
import { CommunityJoinCodesModal } from "../joinCodes/CommunityJoinCodesModal";
import { TransferCommunityOwnershipModal } from "./TransferCommunityOwnershipModal";
import { VerifyCommunityModal } from "./VerifyCommunityModal";
import { DeleteCommunityDialog } from "../DeleteCommunityDialog";
import { JoinCommunityModal } from "../JoinCommunityModal";
import type { CallerMembership, Community } from "../../api/types";
import type { StudyYearMetrics } from "@/features/studyYears";

interface CommunityHeroProps {
  community: Community;
  studyYears?: StudyYearMetrics[];
  callerMembership?: CallerMembership | null;
}

export function CommunityHero({
  community,
  studyYears = [],
  callerMembership,
}: CommunityHeroProps) {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [joinCodesOpen, setJoinCodesOpen] = useState(false);
  const [transferOwnershipOpen, setTransferOwnershipOpen] = useState(false);
  const [verifyModalOpen, setVerifyModalOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [joinModalOpen, setJoinModalOpen] = useState(false);

  const theme = useThemeStore((state) => state.theme);
  const {
    isMember,
    isOwner,
    communityRole,
    canEditCommunity,
    canDeleteCommunity,
    canVerifyCommunity,
    canManageJoinCodes,
  } = usePermissions(callerMembership);

  const totalCourses = studyYears.reduce(
    (acc, year) => acc + (year.coursesCount ?? 0),
    0,
  );
  const totalCredits = studyYears.reduce(
    (acc, year) => acc + (year.creditsCount ?? 0),
    0,
  );

  const isDark =
    theme === "dark" ||
    (theme === "system" &&
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);

  const headerGradientStyle = computeThemeGradient(
    community.backgroundColor,
    isDark,
  );

  const hasAdminMenu =
    canEditCommunity ||
    canDeleteCommunity ||
    canManageJoinCodes ||
    canVerifyCommunity ||
    isOwner;

  return (
    <section className="relative w-full pb-2">
      {/* Dynamic Background Banner */}
      <div
        style={{ background: headerGradientStyle }}
        className="h-44 @[560px]:h-56 @[768px]:h-64 w-full rounded-2xl relative overflow-hidden flex flex-col justify-between p-4 @[560px]:p-6 transition-all duration-300 shadow-inner"
      >
        <div className="flex items-center justify-between gap-2 z-10">
          <AppBreadcrumb />
        </div>

        {/* Decorative Overlay Pattern */}
        <div className="absolute inset-0 bg-radial from-transparent via-transparent to-black/25 pointer-events-none" />
      </div>

      {/* Main Elevated Profile Card */}
      <div className="@container relative -mt-10 @[560px]:-mt-16 max-w-7xl mx-auto rounded-2xl border bg-card p-4 @[560px]:p-6 @[768px]:p-7 shadow-xs space-y-4 @[560px]:space-y-5">
        {/* Top Header Row: Title, Badges (Verified & Role) on left, Gear menu on right */}
        <div className="flex items-start justify-between gap-3 @[560px]:gap-4">
          <div className="space-y-2 min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5 @[560px]:gap-2">
              <h1 className="font-heading text-2xl @[560px]:text-3xl @[768px]:text-3xl font-extrabold tracking-tight text-foreground break-words">
                {community.name}
              </h1>

              {community.verified && (
                <Badge
                  variant="verified"
                  size="xs"
                  className="font-semibold gap-1"
                >
                  <ShieldCheck className="size-3 text-emerald-500" />
                  Verified
                </Badge>
              )}

              {isMember ? (
                <RoleBadge role={communityRole} size="xs" />
              ) : (
                <Button
                  size="xs"
                  onClick={() => setJoinModalOpen(true)}
                  className="gap-1 font-bold shadow-xs cursor-pointer text-xs shrink-0"
                >
                  <KeyRound className="size-3" />
                  <span>Join Community</span>
                </Button>
              )}
            </div>

            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <UserAvatar username={community.owner?.username} size="xs" />
              <span className="truncate">
                Created by{" "}
                <strong className="text-foreground font-semibold">
                  {community.owner?.username ?? "Admin"}
                </strong>
              </span>
            </div>
          </div>

          {/* Right Action Menu */}
          {hasAdminMenu && (
            <div className="shrink-0">
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      className="size-9 rounded-xl hover:bg-muted cursor-pointer"
                      title="Community settings"
                    />
                  }
                >
                  <MoreVertical className="size-4 text-foreground" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52">
                  {canEditCommunity && (
                    <DropdownMenuItem
                      onClick={() => setSettingsOpen(true)}
                      className="gap-2 cursor-pointer text-xs"
                    >
                      <Settings className="size-3.5" />
                      <span>Community Settings</span>
                    </DropdownMenuItem>
                  )}

                  {canManageJoinCodes && (
                    <DropdownMenuItem
                      onClick={() => setJoinCodesOpen(true)}
                      className="gap-2 cursor-pointer text-xs"
                    >
                      <KeyRound className="size-3.5" />
                      <span>Invitation Codes</span>
                    </DropdownMenuItem>
                  )}

                  {canVerifyCommunity && (
                    <DropdownMenuItem
                      onClick={() => setVerifyModalOpen(true)}
                      className="gap-2 cursor-pointer text-xs"
                    >
                      {community.verified ? (
                        <>
                          <ShieldAlert className="size-3.5 text-amber-500" />
                          <span>Revoke Verification</span>
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="size-3.5 text-emerald-500" />
                          <span>Verify Community</span>
                        </>
                      )}
                    </DropdownMenuItem>
                  )}

                  {isOwner && (
                    <DropdownMenuItem
                      onClick={() => setTransferOwnershipOpen(true)}
                      className="gap-2 cursor-pointer text-xs"
                    >
                      <Crown className="size-3.5 text-amber-500" />
                      <span>Transfer Ownership</span>
                    </DropdownMenuItem>
                  )}

                  {canDeleteCommunity && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        variant="destructive"
                        onClick={() => setDeleteOpen(true)}
                        className="gap-2 cursor-pointer text-xs"
                      >
                        <Trash2 className="size-3.5" />
                        <span>Delete Community</span>
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>

        {/* Bio / Description */}
        {community.description && (
          <p className="text-xs @[560px]:text-sm text-muted-foreground leading-relaxed max-w-4xl">
            {community.description}
          </p>
        )}

        {/* Stats Row */}
        <div className="grid grid-cols-2 @[560px]:grid-cols-4 gap-2.5 @[560px]:gap-3.5 pt-2 border-t border-border/60">
          <div className="flex items-center gap-3 p-2.5 @[560px]:p-3 rounded-xl bg-muted/40 border border-border/40">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Users className="size-4.5" />
            </div>
            <div className="min-w-0">
              <span className="block text-[10px] uppercase font-semibold text-muted-foreground">
                Members
              </span>
              <span className="font-heading text-sm @[560px]:text-base font-bold text-foreground truncate block">
                {community.memberCount ?? 1}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 p-2.5 @[560px]:p-3 rounded-xl bg-muted/40 border border-border/40">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <GraduationCap className="size-4.5" />
            </div>
            <div className="min-w-0">
              <span className="block text-[10px] uppercase font-semibold text-muted-foreground">
                Study Years
              </span>
              <span className="font-heading text-sm @[560px]:text-base font-bold text-foreground truncate block">
                {studyYears.length}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 p-2.5 @[560px]:p-3 rounded-xl bg-muted/40 border border-border/40">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <BookOpen className="size-4.5" />
            </div>
            <div className="min-w-0">
              <span className="block text-[10px] uppercase font-semibold text-muted-foreground">
                Courses
              </span>
              <span className="font-heading text-sm @[560px]:text-base font-bold text-foreground truncate block">
                {totalCourses}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 p-2.5 @[560px]:p-3 rounded-xl bg-muted/40 border border-border/40">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Award className="size-4.5" />
            </div>
            <div className="min-w-0">
              <span className="block text-[10px] uppercase font-semibold text-muted-foreground">
                Total Credits
              </span>
              <span className="font-heading text-sm @[560px]:text-base font-bold text-foreground truncate block">
                {totalCredits} ECTS
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Mutation Dialogs */}
      {canEditCommunity && (
        <CommunitySettingsModal
          community={community}
          open={settingsOpen}
          onOpenChange={setSettingsOpen}
        />
      )}

      {canManageJoinCodes && (
        <CommunityJoinCodesModal
          community={community}
          open={joinCodesOpen}
          onOpenChange={setJoinCodesOpen}
        />
      )}

      {canVerifyCommunity && (
        <VerifyCommunityModal
          community={community}
          open={verifyModalOpen}
          onOpenChange={setVerifyModalOpen}
        />
      )}

      {isOwner && (
        <TransferCommunityOwnershipModal
          community={community}
          open={transferOwnershipOpen}
          onOpenChange={setTransferOwnershipOpen}
        />
      )}

      {canDeleteCommunity && (
        <DeleteCommunityDialog
          community={community}
          open={deleteOpen}
          onOpenChange={setDeleteOpen}
        />
      )}

      {!isMember && (
        <JoinCommunityModal
          open={joinModalOpen}
          onOpenChange={setJoinModalOpen}
        />
      )}
    </section>
  );
}
