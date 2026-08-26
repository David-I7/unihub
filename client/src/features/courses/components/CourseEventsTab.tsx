import { useState, useMemo } from "react";
import {
  Calendar,
  Clock,
  AlertCircle,
  CalendarPlus,
  CheckSquare,
  Video,
  MapPin,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useCalendarEvents, type CalendarEvent, type EventType } from "@/features/calendar";

interface CourseEventsTabProps {
  communitySlug: string;
  studyYearSlug: string;
  courseSlug: string;
}

type FilterType = "ALL" | EventType;

function getRelativeTime(date: Date): { text: string; isUrgent: boolean } {
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return { text: "Past Event", isUrgent: false };
  if (diffDays === 0) return { text: "Today", isUrgent: true };
  if (diffDays === 1) return { text: "Tomorrow", isUrgent: true };
  if (diffDays <= 7) return { text: `In ${diffDays} days`, isUrgent: true };
  if (diffDays <= 30) return { text: `In ${Math.ceil(diffDays / 7)} weeks`, isUrgent: false };
  return { text: `In ${diffDays} days`, isUrgent: false };
}

function getEventTheme(type: EventType) {
  switch (type) {
    case "EXAM":
      return {
        label: "Exam",
        colorClass: "bg-rose-500",
        badgeClass: "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30",
        borderHover: "hover:border-rose-500/40",
        clockColor: "text-rose-500",
        icon: AlertCircle,
      };
    case "ASSIGNMENT":
      return {
        label: "Assignment",
        colorClass: "bg-amber-500",
        badgeClass: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30",
        borderHover: "hover:border-amber-500/40",
        clockColor: "text-amber-500",
        icon: CheckSquare,
      };
    case "LECTURE":
    default:
      return {
        label: "Lecture",
        colorClass: "bg-blue-500",
        badgeClass: "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30",
        borderHover: "hover:border-blue-500/40",
        clockColor: "text-blue-500",
        icon: Video,
      };
  }
}

export function CourseEventsTab({
  communitySlug,
  studyYearSlug,
  courseSlug,
}: CourseEventsTabProps) {
  const [filterType, setFilterType] = useState<FilterType>("ALL");

  const {
    data: events = [],
    isLoading,
    isError,
    refetch,
  } = useCalendarEvents({
    communitySlug,
    studyYearName: studyYearSlug,
    courseSlug,
  });

  const examCount = useMemo(
    () => events.filter((e) => e.type === "EXAM").length,
    [events],
  );
  const assignmentCount = useMemo(
    () => events.filter((e) => e.type === "ASSIGNMENT").length,
    [events],
  );
  const lectureCount = useMemo(
    () => events.filter((e) => e.type === "LECTURE").length,
    [events],
  );

  const filteredEvents = useMemo(() => {
    if (filterType === "ALL") return events;
    return events.filter((e) => e.type === filterType);
  }, [events, filterType]);

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
          Failed to load course calendar events.
        </p>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Horizontally Scrolling Filter Chips */}
      <div className="w-full overflow-x-auto no-scrollbar min-w-0">
        <div className="inline-flex min-w-full sm:grid sm:grid-cols-4 gap-1 p-1 bg-muted/60 rounded-xl border border-border/50">
          <button
            type="button"
            onClick={() => setFilterType("ALL")}
            className={`h-8 shrink-0 flex-1 flex items-center justify-center gap-1.5 rounded-lg px-4 text-xs font-semibold whitespace-nowrap transition-all duration-200 ease-out cursor-pointer hover:text-foreground hover:bg-background/40 ${
              filterType === "ALL"
                ? "bg-card text-foreground shadow-xs"
                : "text-muted-foreground"
            }`}
          >
            <Calendar className="size-3.5" />
            <span>All Events</span>
            <span className="text-[11px] opacity-75 font-mono">
              ({events.length})
            </span>
          </button>

          <button
            type="button"
            onClick={() => setFilterType("EXAM")}
            className={`h-8 shrink-0 flex-1 flex items-center justify-center gap-1.5 rounded-lg px-4 text-xs font-semibold whitespace-nowrap transition-all duration-200 ease-out cursor-pointer hover:text-foreground hover:bg-background/40 ${
              filterType === "EXAM"
                ? "bg-card text-foreground shadow-xs"
                : "text-muted-foreground"
            }`}
          >
            <AlertCircle className="size-3.5 text-rose-500" />
            <span>Exams</span>
            <span className="text-[11px] opacity-75 font-mono">
              ({examCount})
            </span>
          </button>

          <button
            type="button"
            onClick={() => setFilterType("ASSIGNMENT")}
            className={`h-8 shrink-0 flex-1 flex items-center justify-center gap-1.5 rounded-lg px-4 text-xs font-semibold whitespace-nowrap transition-all duration-200 ease-out cursor-pointer hover:text-foreground hover:bg-background/40 ${
              filterType === "ASSIGNMENT"
                ? "bg-card text-foreground shadow-xs"
                : "text-muted-foreground"
            }`}
          >
            <CheckSquare className="size-3.5 text-amber-500" />
            <span>Assignments</span>
            <span className="text-[11px] opacity-75 font-mono">
              ({assignmentCount})
            </span>
          </button>

          <button
            type="button"
            onClick={() => setFilterType("LECTURE")}
            className={`h-8 shrink-0 flex-1 flex items-center justify-center gap-1.5 rounded-lg px-4 text-xs font-semibold whitespace-nowrap transition-all duration-200 ease-out cursor-pointer hover:text-foreground hover:bg-background/40 ${
              filterType === "LECTURE"
                ? "bg-card text-foreground shadow-xs"
                : "text-muted-foreground"
            }`}
          >
            <Video className="size-3.5 text-blue-500" />
            <span>Lectures</span>
            <span className="text-[11px] opacity-75 font-mono">
              ({lectureCount})
            </span>
          </button>
        </div>
      </div>

      {/* Events List or Empty State */}
      {filteredEvents.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card p-12 text-center space-y-3">
          <div className="flex size-12 items-center justify-center rounded-xl bg-muted text-muted-foreground">
            <Calendar className="size-6" />
          </div>
          <div className="space-y-1">
            <h3 className="font-heading text-base font-semibold text-foreground">
              No Events Found
            </h3>
            <p className="text-xs text-muted-foreground max-w-sm">
              {filterType === "ALL"
                ? "There are currently no events, exams, assignments, or lectures scheduled for this course."
                : `There are currently no ${filterType.toLowerCase()}s scheduled for this course.`}
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredEvents.map((event: CalendarEvent) => {
            const theme = getEventTheme(event.type);
            const startObj = new Date(event.startTime);
            const endObj = event.endTime ? new Date(event.endTime) : null;

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
            const endTimeStr = endObj
              ? endObj.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : null;

            const relative = getRelativeTime(startObj);
            const isOnline = event.location === "ONLINE";

            return (
              <div
                key={event.id}
                className={`flex flex-col justify-between rounded-2xl border bg-card p-5 shadow-xs hover:shadow-md transition-all space-y-4 ${theme.borderHover}`}
              >
                <div className="flex items-start gap-4">
                  {/* Visual Calendar Date Tile */}
                  <div
                    className={`flex flex-col items-center justify-center size-15 sm:size-16 rounded-xl border border-border/80 bg-card overflow-hidden shrink-0 shadow-2xs`}
                  >
                    <div
                      className={`w-full ${theme.colorClass} py-0.5 text-center text-[10px] font-extrabold tracking-wider text-white`}
                    >
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
                      {/* Event Type Badge */}
                      <Badge
                        variant="outline"
                        className={`text-[10px] font-bold py-0.5 px-1.5 border ${theme.badgeClass}`}
                      >
                        {theme.label}
                      </Badge>

                      {/* Relative Time Badge */}
                      <Badge
                        variant="secondary"
                        className={`text-[10px] font-bold py-0.5 px-2 ${
                          relative.isUrgent
                            ? "bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {relative.text}
                      </Badge>

                      {/* Time */}
                      <span className="flex items-center gap-1 text-xs text-muted-foreground font-medium">
                        <Clock className={`size-3 ${theme.clockColor}`} />
                        {endTimeStr ? `${startTimeStr} - ${endTimeStr}` : startTimeStr}
                      </span>

                      {/* Location Badge */}
                      {event.location && (
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
                      )}

                      {/* Duration */}
                      {event.durationMinutes && (
                        <span className="text-[11px] text-muted-foreground font-medium">
                          ({event.durationMinutes} mins)
                        </span>
                      )}
                    </div>

                    <h4 className="font-heading text-base font-bold text-foreground leading-snug">
                      {event.title}
                    </h4>

                    {event.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                        {event.description}
                      </p>
                    )}

                    {event.locationDetails && (
                      <p className="text-[11px] text-muted-foreground/80 truncate">
                        Location: {event.locationDetails}
                      </p>
                    )}
                  </div>
                </div>

                {/* Card Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-border/60 text-xs">
                  <span className="text-[11px] text-muted-foreground truncate max-w-[140px]">
                    By {event.owner?.username ?? "Instructor"}
                  </span>

                  <Button
                    variant="ghost"
                    size="xs"
                    className="gap-1.5 text-xs hover:bg-muted cursor-pointer"
                    onClick={() => {
                      // Future calendar subscription hook
                    }}
                  >
                    <CalendarPlus className="size-3.5 text-primary" />
                    <span>{event.isSubscribed ? "Subscribed ✓" : "Add to Calendar"}</span>
                    <ExternalLink className="size-3 opacity-60" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
