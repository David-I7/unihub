import { useState } from "react";
import {
  ShieldCheck,
  Check,
  MoreVertical,
  Settings,
  KeyRound,
  Trash2,
  Users,
  GraduationCap,
  BookOpen,
  Award,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/app/UserAvatar";
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
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [joinModalOpen, setJoinModalOpen] = useState(false);

  const {
    isMember,
    communityRole,
    canEditCommunity,
    canManageJoinCodes,
    canDeleteCommunity,
  } = usePermissions(callerMembership);

  const roleLabel =
    communityRole === "COMMUNITY_OWNER"
      ? "Owner"
      : communityRole === "COMMUNITY_ADMIN"
        ? "Admin"
        : "Member";

  const resolvedTheme = useThemeStore((state) => state.resolvedTheme);
  const isDark = resolvedTheme === "dark";

  const gradientBg = computeThemeGradient(
    community.backgroundColor,
    isDark,
    180,
  );

  const canManageCommunity =
    canEditCommunity || canManageJoinCodes || canDeleteCommunity;

  const totalCourses = studyYears.reduce(
    (acc: number, year: StudyYearMetrics) =>
      acc + (year.coursesCount || 0) + (year.archivedCoursesCount || 0),
    0,
  );

  const totalCredits = studyYears.reduce(
    (acc: number, year: StudyYearMetrics) => acc + (year.creditsCount || 0),
    0,
  );

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Top Ambient Gradient Banner */}
      <div
        className="relative h-24 sm:h-32 -mx-4 -mt-4 sm:-mx-6 sm:-mt-6 px-4 sm:px-8 pt-3 sm:pt-6 rounded-b-2xl sm:rounded-b-3xl overflow-hidden transition-all duration-300 shadow-xs"
        style={{ background: gradientBg }}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <AppBreadcrumb className="text-white/90 [&_a]:text-white/90 [&_a:hover]:text-white [&_[data-slot=breadcrumb-page]]:text-white [&_[data-slot=breadcrumb-separator]]:text-white/60 text-xs font-medium drop-shadow-xs truncate max-w-full" />
        </div>
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
                  variant="secondary"
                  className="bg-black/40 text-white border border-white/20 backdrop-blur-xs font-semibold gap-1 text-[11px]"
                >
                  <ShieldCheck className="size-3 text-emerald-400" />
                  Verified
                </Badge>
              )}

              {isMember ? (
                <Badge
                  variant="secondary"
                  className="bg-black/40 text-white border border-white/20 backdrop-blur-xs font-semibold gap-1 text-[11px]"
                >
                  {roleLabel}
                </Badge>
              ) : (
                <Button
                  size="xs"
                  onClick={() => setJoinModalOpen(true)}
                  className="gap-1 font-bold shadow-xs cursor-pointer text-xs shrink-0"
                >
                  <KeyRound className="size-3" />
                  Join Community
                </Button>
              )}
            </div>

            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <UserAvatar
                username={community.owner?.username}
                className="size-5 rounded-md text-[10px]"
                fallbackClassName="rounded-md"
                size="sm"
              />
              <span className="truncate">
                Created by{" "}
                <strong className="text-foreground font-semibold">
                  {community.owner?.username ?? "Admin"}
                </strong>
              </span>
            </div>
          </div>

          {/* Right Action: 3-dots Gear Operations Menu */}
          {canManageCommunity && (
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    variant="outline"
                    size="icon-sm"
                    className="size-8 @[560px]:size-8.5 rounded-xl cursor-pointer text-muted-foreground hover:text-foreground shrink-0"
                    aria-label="Community settings & operations"
                  >
                    <MoreVertical className="size-4" />
                  </Button>
                }
              />
              <DropdownMenuContent align="end" className="w-52">
                {canEditCommunity && (
                  <DropdownMenuItem
                    onClick={() => setSettingsOpen(true)}
                    className="gap-2 text-xs cursor-pointer"
                  >
                    <Settings className="size-4" />
                    <span>Community Settings</span>
                  </DropdownMenuItem>
                )}

                {canManageJoinCodes && (
                  <DropdownMenuItem
                    onClick={() => setJoinCodesOpen(true)}
                    className="gap-2 text-xs cursor-pointer"
                  >
                    <KeyRound className="size-4" />
                    <span>Invitation Codes</span>
                  </DropdownMenuItem>
                )}

                {canDeleteCommunity && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      variant="destructive"
                      onClick={() => setDeleteOpen(true)}
                      className="gap-2 text-xs cursor-pointer"
                    >
                      <Trash2 className="size-4" />
                      <span>Delete Community</span>
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Description */}
        {community.description && (
          <p className="text-xs @[560px]:text-sm text-muted-foreground leading-relaxed max-w-4xl break-words">
            {community.description}
          </p>
        )}

        {/* Key Community Metrics: 2 columns below 560px, 4 columns at >= 560px */}
        <div className="grid grid-cols-2 @[560px]:grid-cols-4 gap-2 @[560px]:gap-2.5 pt-2.5 @[560px]:pt-3.5 border-t border-border/60">
          <div className="rounded-lg @[560px]:rounded-xl border border-border/70 bg-muted/20 py-2 px-2.5 @[560px]:p-3.5 flex flex-col items-center justify-center text-center space-y-0.5 @[560px]:space-y-1 shadow-2xs">
            <span className="flex items-center justify-center gap-1 @[560px]:gap-1.5 text-[10px] @[560px]:text-xs font-semibold text-muted-foreground">
              <Users className="size-3 @[560px]:size-3.5 text-primary shrink-0" />
              Enrolled Members
            </span>
            <p className="font-heading text-sm @[560px]:text-xl font-bold text-foreground">
              {community.memberCount ?? 0}
            </p>
          </div>

          <div className="rounded-lg @[560px]:rounded-xl border border-border/70 bg-muted/20 py-2 px-2.5 @[560px]:p-3.5 flex flex-col items-center justify-center text-center space-y-0.5 @[560px]:space-y-1 shadow-2xs">
            <span className="flex items-center justify-center gap-1 @[560px]:gap-1.5 text-[10px] @[560px]:text-xs font-semibold text-muted-foreground">
              <GraduationCap className="size-3 @[560px]:size-3.5 text-primary shrink-0" />
              Study Years
            </span>
            <p className="font-heading text-sm @[560px]:text-xl font-bold text-foreground">
              {studyYears.length}
            </p>
          </div>

          <div className="rounded-lg @[560px]:rounded-xl border border-border/70 bg-muted/20 py-2 px-2.5 @[560px]:p-3.5 flex flex-col items-center justify-center text-center space-y-0.5 @[560px]:space-y-1 shadow-2xs">
            <span className="flex items-center justify-center gap-1 @[560px]:gap-1.5 text-[10px] @[560px]:text-xs font-semibold text-muted-foreground">
              <BookOpen className="size-3 @[560px]:size-3.5 text-primary shrink-0" />
              Total Courses
            </span>
            <p className="font-heading text-sm @[560px]:text-xl font-bold text-foreground">
              {totalCourses}
            </p>
          </div>

          <div className="rounded-lg @[560px]:rounded-xl border border-border/70 bg-muted/20 py-2 px-2.5 @[560px]:p-3.5 flex flex-col items-center justify-center text-center space-y-0.5 @[560px]:space-y-1 shadow-2xs">
            <span className="flex items-center justify-center gap-1 @[560px]:gap-1.5 text-[10px] @[560px]:text-xs font-semibold text-muted-foreground">
              <Award className="size-3 @[560px]:size-3.5 text-primary shrink-0" />
              ECTS Credits
            </span>
            <p className="font-heading text-sm @[560px]:text-xl font-bold text-foreground">
              {totalCredits}
            </p>
          </div>
        </div>
      </div>

      <CommunitySettingsModal
        community={community}
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
      />

      <CommunityJoinCodesModal
        community={community}
        open={joinCodesOpen}
        onOpenChange={setJoinCodesOpen}
      />

      <DeleteCommunityDialog
        community={community}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
      />

      <JoinCommunityModal
        open={joinModalOpen}
        onOpenChange={setJoinModalOpen}
      />
    </div>
  );
}
