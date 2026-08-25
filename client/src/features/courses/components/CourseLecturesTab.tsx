import { Video, MapPin, Clock, CalendarPlus, AlertCircle, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useCourseLectures } from "../api/getCourseLectures";

interface CourseLecturesTabProps {
  communitySlug: string;
  studyYearSlug: string;
  courseId: number | string;
}

function getRelativeLecture(date: Date): { text: string; isUrgent: boolean } {
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return { text: "Past Session", isUrgent: false };
  if (diffDays === 0) return { text: "Today", isUrgent: true };
  if (diffDays === 1) return { text: "Tomorrow", isUrgent: true };
  if (diffDays <= 7) return { text: `In ${diffDays} days`, isUrgent: true };
  return { text: `Upcoming`, isUrgent: false };
}

export function CourseLecturesTab({
  communitySlug,
  studyYearSlug,
  courseId,
}: CourseLecturesTabProps) {
  const {
    data,
    isLoading,
    isError,
    refetch,
  } = useCourseLectures(communitySlug, studyYearSlug, courseId, { size: 20 });

  const lectures = data?.content ?? [];

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
          Failed to load course lectures.
        </p>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          Try Again
        </Button>
      </div>
    );
  }

  if (lectures.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card p-12 text-center space-y-3">
        <div className="flex size-12 items-center justify-center rounded-xl bg-muted text-muted-foreground">
          <Video className="size-6" />
        </div>
        <div className="space-y-1">
          <h3 className="font-heading text-base font-semibold text-foreground">
            No Lectures Scheduled
          </h3>
          <p className="text-xs text-muted-foreground max-w-sm">
            There are no lecture sessions currently scheduled for this course.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Schedule Header & Timetable Sync Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-blue-500/5 border-blue-500/20 px-4 py-3">
        <div className="flex items-center gap-2.5">
          <div className="flex size-8 items-center justify-center rounded-lg bg-blue-500/15 text-blue-600 dark:text-blue-400">
            <AlertCircle className="size-4" />
          </div>
          <div>
            <p className="text-xs font-bold text-foreground">
              {lectures.length} Scheduled Lecture{lectures.length > 1 ? "s" : ""}
            </p>
            <p className="text-[11px] text-muted-foreground">
              Timeslots, physical classrooms, and online session meeting links.
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          className="h-8 gap-1.5 text-xs rounded-lg border-blue-500/30 text-blue-600 dark:text-blue-400 hover:bg-blue-500 hover:text-white cursor-pointer transition-colors"
          onClick={() => {
            // Future calendar integration hook
          }}
        >
          <CalendarPlus className="size-3.5" />
          <span>Subscribe to Class Timetable</span>
        </Button>
      </div>

      {/* Lecture Scheduling Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {lectures.map((lecture) => {
          const startObj = new Date(lecture.startTime);
          const endObj = new Date(lecture.endTime);

          const monthStr = startObj
            .toLocaleDateString("en-US", { month: "short" })
            .toUpperCase();
          const dayNum = startObj.getDate();
          const weekdayStr = startObj
            .toLocaleDateString("en-US", { weekday: "short" })
            .toUpperCase();

          const startTimeStr = startObj.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          });
          const endTimeStr = endObj.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          });

          const isOnline = lecture.location === "ONLINE";
          const relative = getRelativeLecture(startObj);

          return (
            <div
              key={lecture.id}
              className="flex flex-col justify-between rounded-2xl border bg-card p-5 shadow-xs hover:shadow-md hover:border-blue-500/40 transition-all space-y-4"
            >
              <div className="flex items-start gap-4">
                {/* Visual Calendar Date Tile */}
                <div className="flex flex-col items-center justify-center size-15 sm:size-16 rounded-xl border border-blue-500/30 bg-card overflow-hidden shrink-0 shadow-2xs">
                  <div className="w-full bg-blue-500 py-0.5 text-center text-[10px] font-extrabold tracking-wider text-white">
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
                          ? "bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {relative.text}
                    </Badge>

                    <span className="flex items-center gap-1 text-xs text-muted-foreground font-medium">
                      <Clock className="size-3 text-blue-500" />
                      {startTimeStr} - {endTimeStr}
                    </span>

                    <Badge
                      variant="outline"
                      className={`text-[10px] font-bold py-0.5 px-1.5 gap-1 ${
                        isOnline
                          ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20"
                          : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                      }`}
                    >
                      {isOnline ? (
                        <>
                          <Video className="size-3" /> Online
                        </>
                      ) : (
                        <>
                          <MapPin className="size-3" /> In-Person
                        </>
                      )}
                    </Badge>
                  </div>

                  <h4 className="font-heading text-base font-bold text-foreground leading-snug">
                    {lecture.title}
                  </h4>

                  {lecture.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      {lecture.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Card Footer: Metadata & Calendar Link Action */}
              <div className="flex items-center justify-between pt-3 border-t border-border/60 text-xs">
                <span className="text-[11px] text-muted-foreground truncate max-w-[140px]">
                  Prof. {lecture.owner.username}
                </span>

                <Button
                  variant="ghost"
                  size="xs"
                  className="gap-1.5 text-xs text-blue-600 dark:text-blue-400 hover:bg-blue-500/10 cursor-pointer"
                  onClick={() => {
                    // Future calendar integration hook
                  }}
                >
                  <CalendarPlus className="size-3.5" />
                  <span>Add to Schedule</span>
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
