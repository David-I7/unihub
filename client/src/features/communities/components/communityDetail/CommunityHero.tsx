import { useState } from "react";
import { ShieldCheck, ShieldAlert } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { computeThemeGradient } from "@/lib/gradientUtils";
import { useThemeStore } from "@/store/useThemeStore";
import { CommunityBreadcrumb } from "../CommunityBreadcrumb";
import type { Community } from "../../api/types";
import type { StudyYearMetrics } from "@/features/studyYears";

interface CommunityHeroProps {
  community: Community;
  studyYears?: StudyYearMetrics[];
  isInitiallyJoined?: boolean;
  onJoinToggle?: (communityId: string, isJoined: boolean) => void;
}

export function CommunityHero({
  community,
  studyYears = [],
  isInitiallyJoined = false,
  onJoinToggle,
}: CommunityHeroProps) {
  const [isJoined, setIsJoined] = useState(isInitiallyJoined);
  const resolvedTheme = useThemeStore((state) => state.resolvedTheme);
  const isDark = resolvedTheme === "dark";

  const gradientBg = computeThemeGradient(
    community.backgroundColor,
    isDark,
    180,
  );

  const handleJoinClick = () => {
    const nextState = !isJoined;
    setIsJoined(nextState);
    onJoinToggle?.(community.id, nextState);
  };

  const totalCourses = studyYears.reduce(
    (acc: number, year: StudyYearMetrics) =>
      acc + (year.coursesCount || 0) + (year.archivedCoursesCount || 0),
    0,
  );

  const totalCredits = studyYears.reduce(
    (acc: number, year: StudyYearMetrics) => acc + (year.creditsCount || 0),
    0,
  );

  const ownerInitials = community.owner?.username
    ? community.owner.username.slice(0, 2).toUpperCase()
    : "U";

  return (
    <div
      className="relative w-auto -mx-4 -mt-4 sm:-mx-6 sm:-mt-6 px-4 pt-6 pb-12 sm:px-8 sm:pt-8 sm:pb-16 text-white overflow-hidden transition-all duration-300"
      style={{ background: gradientBg }}
    >
      {/* Bottom theme-aware fade transition to blend seamlessly into the page */}
      <div className="absolute inset-x-0 bottom-0 h-14 sm:h-20 bg-gradient-to-b from-transparent via-background/30 to-background pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto space-y-6">
        {/* Top utility bar: Breadcrumb on left, Verified status & Action on right */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CommunityBreadcrumb className="text-white/90 [&_a]:text-white/90 [&_a:hover]:text-white [&_[data-slot=breadcrumb-page]]:text-white [&_[data-slot=breadcrumb-separator]]:text-white/60 text-xs font-medium drop-shadow-xs" />

          <div className="flex items-center gap-2.5">
            {community.verified ? (
              <Badge
                variant="secondary"
                className="bg-black/30 dark:bg-black/40 text-white border border-white/20 backdrop-blur-md font-semibold gap-1.5 py-1 px-2.5 text-xs shadow-xs"
              >
                <ShieldCheck className="size-3.5 text-emerald-300" />
                Verified Community
              </Badge>
            ) : (
              <Badge
                variant="secondary"
                className="bg-black/30 dark:bg-black/40 text-white border border-white/20 backdrop-blur-md font-semibold gap-1.5 py-1 px-2.5 text-xs shadow-xs"
              >
                <ShieldAlert className="size-3.5 text-amber-300" />
                Community Hub
              </Badge>
            )}

            <Button
              size="sm"
              variant={isJoined ? "secondary" : "default"}
              onClick={handleJoinClick}
              className={
                isJoined
                  ? "bg-emerald-600 text-white hover:bg-emerald-700 font-bold shadow-xs transition-colors cursor-pointer"
                  : "bg-white text-neutral-900 hover:bg-white/90 font-bold shadow-xs transition-colors cursor-pointer"
              }
            >
              {isJoined ? "Joined ✓" : "+ Join Community"}
            </Button>
          </div>
        </div>

        {/* Main Identity: Title, Description, and Creator */}
        <div className="space-y-3">
          <div className="space-y-1.5">
            <h1 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white drop-shadow-xs">
              {community.name}
            </h1>
            {community.description && (
              <p className="text-xs sm:text-sm text-white/90 max-w-3xl leading-relaxed drop-shadow-xs">
                {community.description}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs text-white/85 pt-1">
            <Avatar
              size="sm"
              className="size-5 border border-white/30 shadow-2xs"
            >
              <AvatarFallback className="bg-black/40 text-white font-bold text-[10px]">
                {ownerInitials}
              </AvatarFallback>
            </Avatar>
            <span>
              Created by{" "}
              <strong className="text-white font-semibold">
                {community.owner?.username ?? "Admin"}
              </strong>
            </span>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3">
          <div className="rounded-xl bg-card/85 dark:bg-black/35 backdrop-blur-md border border-border/40 dark:border-white/10 p-3.5 text-center space-y-0.5 shadow-xs transition-colors">
            <span className="flex items-center justify-center gap-1.5 text-[11px] font-medium text-muted-foreground dark:text-white/75">
              Enrolled Members
            </span>
            <p className="font-heading text-lg sm:text-xl font-bold text-foreground dark:text-white">
              {community.memberCount ?? 0}
            </p>
          </div>

          <div className="rounded-xl bg-card/85 dark:bg-black/35 backdrop-blur-md border border-border/40 dark:border-white/10 p-3.5 text-center space-y-0.5 shadow-xs transition-colors">
            <span className="flex items-center justify-center gap-1.5 text-[11px] font-medium text-muted-foreground dark:text-white/75">
              Study Years
            </span>
            <p className="font-heading text-lg sm:text-xl font-bold text-foreground dark:text-white">
              {studyYears.length}
            </p>
          </div>

          <div className="rounded-xl bg-card/85 dark:bg-black/35 backdrop-blur-md border border-border/40 dark:border-white/10 p-3.5 text-center space-y-0.5 shadow-xs transition-colors">
            <span className="flex items-center justify-center gap-1.5 text-[11px] font-medium text-muted-foreground dark:text-white/75">
              Total Courses
            </span>
            <p className="font-heading text-lg sm:text-xl font-bold text-foreground dark:text-white">
              {totalCourses}
            </p>
          </div>

          <div className="rounded-xl bg-card/85 dark:bg-black/35 backdrop-blur-md border border-border/40 dark:border-white/10 p-3.5 text-center space-y-0.5 shadow-xs transition-colors">
            <span className="flex items-center justify-center gap-1.5 text-[11px] font-medium text-muted-foreground dark:text-white/75">
              ECTS Credits
            </span>
            <p className="font-heading text-lg sm:text-xl font-bold text-foreground dark:text-white">
              {totalCredits}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
