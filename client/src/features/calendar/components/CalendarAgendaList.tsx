import { useMemo } from "react";
import {
  Bell,
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Globe,
  ChevronRight,
} from "lucide-react";
import type { CalendarEvent } from "../api/types";
import { useCalendarStore } from "../store/useCalendarStore";
import { getEventCategoryConfig } from "../utils/eventUtils";
import {
  formatDayHeader,
  formatTimeRange,
  getLocalDateKey,
} from "@/lib/dateUtils";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface CalendarAgendaListProps {
  events: CalendarEvent[];
}

function formatDuration(minutes?: number): string | null {
  if (!minutes || minutes <= 0) return null;
  if (minutes >= 60) {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  }
  return `${minutes} min`;
}

export function CalendarAgendaList({ events }: CalendarAgendaListProps) {
  const currentDate = useCalendarStore((s) => s.currentDate);
  const openEventDetails = useCalendarStore((s) => s.openEventDetails);

  const groupedEvents = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();

    for (const ev of events) {
      const d = new Date(ev.startTime);
      if (isNaN(d.getTime())) continue;
      const key = getLocalDateKey(d);
      if (!map.has(key)) {
        map.set(key, []);
      }
      map.get(key)!.push(ev);
    }

    // Sort days chronologically
    const sortedKeys = Array.from(map.keys()).sort();

    return sortedKeys.map((key) => {
      const dayEvents = map.get(key)!;
      dayEvents.sort(
        (a, b) =>
          new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
      );
      return {
        dateStr: key,
        events: dayEvents,
        ...formatDayHeader(key),
      };
    });
  }, [events]);

  if (events.length === 0) {
    const monthName = currentDate.toLocaleDateString(undefined, {
      month: "long",
      year: "numeric",
    });

    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed bg-card p-8 sm:p-12 text-center shadow-xs">
        <div className="flex size-12 items-center justify-center rounded-xl bg-muted text-muted-foreground">
          <CalendarIcon className="size-6" />
        </div>
        <h3 className="font-heading mt-3 text-base font-semibold text-foreground">
          No events in {monthName}
        </h3>
        <p className="mt-1 max-w-sm text-xs text-muted-foreground">
          There are no exams, assignments, or lectures scheduled matching your
          filters for this month.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {groupedEvents.map((group) => (
        <div key={group.dateStr} className="space-y-3">
          {/* Day Header with Sticky-friendly style */}
          <div className="flex items-center justify-between gap-3 px-1">
            <div className="flex items-center gap-2.5">
              <span
                className={cn(
                  "font-heading text-sm font-bold uppercase tracking-wider",
                  group.isToday ? "text-primary font-extrabold" : "text-foreground",
                )}
              >
                {group.weekday}, {group.formattedDate}
              </span>

              {group.isToday && (
                <Badge
                  variant="default"
                  className="h-5 px-2 text-[10px] font-bold uppercase tracking-wider bg-primary text-primary-foreground shadow-xs"
                >
                  Today
                </Badge>
              )}
            </div>

            <span className="text-xs text-muted-foreground font-medium">
              {group.events.length} {group.events.length === 1 ? "event" : "events"}
            </span>
          </div>

          {/* Events List for this Day */}
          <div className="space-y-3">
            {group.events.map((event) => {
              const config = getEventCategoryConfig(event.type);
              const Icon = config.icon;
              const timeStr = formatTimeRange(event.startTime, event.endTime);
              const durationStr = formatDuration(event.durationMinutes);
              const abbreviation = event.courseAbbreviation?.trim();
              const isOnline = event.location === "ONLINE";

              return (
                <div
                  key={event.id}
                  onClick={() => openEventDetails(event.id)}
                  className="group relative overflow-hidden rounded-2xl border bg-card p-4 sm:p-5 shadow-xs transition-all duration-200 hover:border-primary/60 hover:shadow-md cursor-pointer space-y-3 group-hover:-translate-y-0.5"
                >
                  {/* Top Row: Category Badge + Course Tag + Location Badge + Time Pill */}
                  <div className="flex flex-wrap items-center justify-between gap-2.5">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {/* Event Type Badge */}
                      <span
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold uppercase tracking-wide",
                          config.badge,
                        )}
                      >
                        <Icon className="size-3.5 shrink-0" />
                        <span>{config.label}</span>
                      </span>

                      {/* Course Abbreviation */}
                      {abbreviation && (
                        <span className="font-mono text-xs font-bold text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-lg uppercase">
                          {abbreviation}
                        </span>
                      )}

                      {/* Study Year */}
                      {event.studyYear && (
                        <Badge
                          variant="outline"
                          size="xs"
                          className="font-medium text-muted-foreground"
                        >
                          {event.studyYear}
                        </Badge>
                      )}

                      {/* Location Badge */}
                      {event.location && (
                        <Badge
                          variant="secondary"
                          size="xs"
                          className="font-medium gap-1 text-muted-foreground"
                        >
                          {isOnline ? (
                            <Globe className="size-3 text-blue-500" />
                          ) : (
                            <MapPin className="size-3 text-amber-500" />
                          )}
                          <span className="capitalize">
                            {event.location.toLowerCase().replace("_", " ")}
                          </span>
                        </Badge>
                      )}
                    </div>

                    {/* Time & Duration Display */}
                    {timeStr && (
                      <div className="flex items-center gap-2 font-mono text-xs font-semibold text-foreground bg-muted/60 px-2.5 py-1 rounded-xl border border-border/40 shrink-0">
                        <Clock className="size-3.5 text-muted-foreground" />
                        <span>{timeStr}</span>
                        {durationStr && (
                          <span className="text-[11px] text-muted-foreground font-normal">
                            • {durationStr}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Middle Content: Title and Course / Community Details */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="space-y-1 min-w-0 flex-1">
                      <h4 className="font-heading text-base font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                        {event.title}
                      </h4>

                      <div className="flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
                        {event.courseName && (
                          <span className="font-medium text-foreground/85 truncate max-w-sm">
                            {event.courseName}
                          </span>
                        )}
                        {event.communityName && (
                          <span className="truncate max-w-xs text-muted-foreground/70">
                            • {event.communityName}
                          </span>
                        )}
                      </div>
                    </div>

                    <ChevronRight className="size-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0 hidden sm:block" />
                  </div>

                  {/* Footer: Subscription / Reminder Badge */}
                  {event.isSubscribed && (
                    <div className="pt-2 border-t border-border/50 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5 text-primary font-semibold text-[11px]">
                        <Bell className="size-3.5 fill-primary text-primary" />
                        <span>Reminder notification enabled</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
