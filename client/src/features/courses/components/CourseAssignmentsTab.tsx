import { CheckSquare, Clock, CalendarPlus, AlertCircle, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useCourseAssignments } from "../api/getCourseAssignments";

interface CourseAssignmentsTabProps {
  communitySlug: string;
  studyYearSlug: string;
  courseSlug: string;
}

function getRelativeDeadline(date: Date): { text: string; isUrgent: boolean } {
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return { text: "Past Deadline", isUrgent: false };
  if (diffDays === 0) return { text: "Due Today", isUrgent: true };
  if (diffDays === 1) return { text: "Due Tomorrow", isUrgent: true };
  if (diffDays <= 7) return { text: `Due in ${diffDays} days`, isUrgent: true };
  if (diffDays <= 30) return { text: `Due in ${Math.ceil(diffDays / 7)} weeks`, isUrgent: false };
  return { text: `Due in ${diffDays} days`, isUrgent: false };
}

export function CourseAssignmentsTab({
  communitySlug,
  studyYearSlug,
  courseSlug,
}: CourseAssignmentsTabProps) {
  const {
    data,
    isLoading,
    isError,
    refetch,
  } = useCourseAssignments(communitySlug, studyYearSlug, courseSlug, { size: 20 });

  const assignments = data?.content ?? [];

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex gap-4 rounded-2xl border bg-card p-5">
            <Skeleton className="size-16 rounded-xl shrink-0" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-4 w-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-destructive/20 bg-destructive/5 p-12 text-center space-y-3">
        <p className="text-sm font-semibold text-destructive">
          Failed to load course assignments.
        </p>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          Try Again
        </Button>
      </div>
    );
  }

  if (assignments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card p-12 text-center space-y-3">
        <div className="flex size-12 items-center justify-center rounded-xl bg-muted text-muted-foreground">
          <CheckSquare className="size-6" />
        </div>
        <div className="space-y-1">
          <h3 className="font-heading text-base font-semibold text-foreground">
            No Assignments Found
          </h3>
          <p className="text-xs text-muted-foreground max-w-sm">
            There are currently no assignments or homework projects registered for this course.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Schedule Header & Deadlines Sync Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-amber-500/5 border-amber-500/20 px-4 py-3">
        <div className="flex items-center gap-2.5">
          <div className="flex size-8 items-center justify-center rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400">
            <AlertCircle className="size-4" />
          </div>
          <div>
            <p className="text-xs font-bold text-foreground">
              {assignments.length} Course Assignment{assignments.length > 1 ? "s" : ""}
            </p>
            <p className="text-[11px] text-muted-foreground">
              Track project deadlines and submission requirements.
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          className="h-8 gap-1.5 text-xs rounded-lg border-amber-500/30 text-amber-600 dark:text-amber-400 hover:bg-amber-500 hover:text-white cursor-pointer transition-colors"
          onClick={() => {
            // Future calendar integration hook
          }}
        >
          <CalendarPlus className="size-3.5" />
          <span>Sync Deadlines with Calendar</span>
        </Button>
      </div>

      {/* Assignment Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {assignments.map((item) => {
          const dueObj = new Date(item.dueDate);
          const monthStr = dueObj
            .toLocaleDateString("en-US", { month: "short" })
            .toUpperCase();
          const dayNum = dueObj.getDate();
          const weekdayStr = dueObj
            .toLocaleDateString("en-US", { weekday: "short" })
            .toUpperCase();
          const timeStr = dueObj.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          });

          const relative = getRelativeDeadline(dueObj);

          return (
            <div
              key={item.id}
              className="flex flex-col justify-between rounded-2xl border bg-card p-5 shadow-xs hover:shadow-md hover:border-amber-500/40 transition-all space-y-4"
            >
              <div className="flex items-start gap-4">
                {/* Visual Calendar Date Tile */}
                <div className="flex flex-col items-center justify-center size-15 sm:size-16 rounded-xl border border-amber-500/30 bg-card overflow-hidden shrink-0 shadow-2xs">
                  <div className="w-full bg-amber-500 py-0.5 text-center text-[10px] font-extrabold tracking-wider text-white">
                    {monthStr}
                  </div>
                  <div className="flex-1 flex flex-col items-center justify-center">
                    <span className="text-xl font-extrabold font-heading text-foreground leading-none">
                      {dayNum}
                    </span>
                    <span className="text-[9px] font-bold text-muted-foreground">
                      {weekdayStr}
                    </span>
                  </div>
                </div>

                {/* Content & Details */}
                <div className="space-y-1.5 min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <Badge
                      variant="secondary"
                      className={`text-[10px] font-bold py-0.5 px-2 ${
                        relative.isUrgent
                          ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {relative.text}
                    </Badge>

                    <span className="flex items-center gap-1 text-xs text-muted-foreground font-medium">
                      <Clock className="size-3 text-amber-500" />
                      {timeStr}
                    </span>

                    {item.estimatedDurationMinutes && (
                      <span className="text-[11px] text-muted-foreground font-medium">
                        (~{Math.round(item.estimatedDurationMinutes / 60)} hrs effort)
                      </span>
                    )}
                  </div>

                  <h4 className="font-heading text-base font-bold text-foreground leading-snug">
                    {item.title}
                  </h4>

                  {item.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Card Footer: Metadata & Calendar Link Action */}
              <div className="flex items-center justify-between pt-3 border-t border-border/60 text-xs">
                <span className="text-[11px] text-muted-foreground truncate max-w-[140px]">
                  Created by {item.owner.username}
                </span>

                <Button
                  variant="ghost"
                  size="xs"
                  className="gap-1.5 text-xs text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 cursor-pointer"
                  onClick={() => {
                    // Future calendar integration hook
                  }}
                >
                  <CalendarPlus className="size-3.5" />
                  <span>Add Deadline</span>
                  <ExternalLink className="size-3 opacity-60" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
