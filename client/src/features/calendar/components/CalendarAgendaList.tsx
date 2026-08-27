import { useMemo } from "react";
import {
  Calendar as CalendarIcon,
  Clock,
  ExternalLink,
  MapPin,
} from "lucide-react";
import type { CalendarEvent } from "../api/types";
import { getEventCategoryConfig } from "./CalendarEventPill";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface CalendarAgendaListProps {
  currentDate: Date;
  events: CalendarEvent[];
  onSelectEvent: (event: CalendarEvent) => void;
}

function getLocalDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function formatDayHeader(dateStr: string): {
  weekday: string;
  formattedDate: string;
  isToday: boolean;
} {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  const todayStr = getLocalDateKey(new Date());

  const weekday = date.toLocaleDateString(undefined, { weekday: "short" });
  const formattedDate = date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });

  return {
    weekday,
    formattedDate,
    isToday: dateStr === todayStr,
  };
}

function formatTimeRange(startTime?: string, endTime?: string): string {
  if (!startTime) return "";
  const startD = new Date(startTime);
  if (isNaN(startD.getTime())) return "";

  const startFormatted = startD.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  if (!endTime) return startFormatted;
  const endD = new Date(endTime);
  if (isNaN(endD.getTime())) return startFormatted;

  const endFormatted = endD.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  return `${startFormatted} - ${endFormatted}`;
}

export function CalendarAgendaList({
  currentDate,
  events,
  onSelectEvent,
}: CalendarAgendaListProps) {
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
    <div className="space-y-4">
      {groupedEvents.map((group) => (
        <div
          key={group.dateStr}
          className="overflow-hidden rounded-2xl border bg-card shadow-xs"
        >
          {/* Day Header */}
          <div className="flex items-center justify-between border-b bg-muted/40 px-4 py-2.5">
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "font-heading text-xs font-bold uppercase tracking-wider",
                  group.isToday ? "text-primary font-extrabold" : "text-foreground",
                )}
              >
                {group.weekday}, {group.formattedDate}
              </span>

              {group.isToday && (
                <Badge
                  variant="default"
                  className="h-4 px-1.5 text-[9px] font-bold uppercase tracking-wider bg-primary text-primary-foreground"
                >
                  Today
                </Badge>
              )}
            </div>
          </div>

          {/* Day Events Feed */}
          <div className="divide-y divide-border">
            {group.events.map((event) => {
              const config = getEventCategoryConfig(event.type);
              const Icon = config.icon;
              const timeStr = formatTimeRange(event.startTime, event.endTime);
              const abbreviation =
                event.courseAbbreviation?.trim() || "ABBV";
              const isUrl =
                event.locationDetails?.startsWith("http://") ||
                event.locationDetails?.startsWith("https://");

              return (
                <div
                  key={event.id}
                  onClick={() => onSelectEvent(event)}
                  className="group flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 transition-colors hover:bg-muted/30 cursor-pointer"
                >
                  <div className="min-w-0 flex-1 space-y-1.5">
                    {/* Top Row: Category Badge + Course Abbreviation + Course Name */}
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide",
                          config.container,
                        )}
                      >
                        <Icon className="size-3 shrink-0" />
                        {config.label}
                      </span>

                      <span className="font-mono text-[10px] font-bold text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                        {abbreviation}
                      </span>

                      {event.courseName && (
                        <span className="text-[11px] font-medium text-muted-foreground truncate max-w-[200px]">
                          {event.courseName}
                        </span>
                      )}
                    </div>

                    {/* Event Title */}
                    <h4 className="font-heading text-sm font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                      {event.title}
                    </h4>

                    {/* Description preview */}
                    {event.description && (
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {event.description}
                      </p>
                    )}
                  </div>

                  {/* Right Side / Meta: Time and Location */}
                  <div className="flex flex-wrap sm:flex-col sm:items-end items-center gap-2 sm:gap-1 text-xs text-muted-foreground shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0">
                    {timeStr && (
                      <div className="flex items-center gap-1 font-mono text-[11px] font-semibold text-foreground">
                        <Clock className="size-3 text-muted-foreground" />
                        <span>{timeStr}</span>
                      </div>
                    )}

                    {event.locationDetails && (
                      <div className="flex items-center gap-1 text-[11px]">
                        <MapPin className="size-3 text-muted-foreground shrink-0" />
                        {isUrl ? (
                          <span className="text-primary hover:underline inline-flex items-center gap-0.5">
                            Online Meeting <ExternalLink className="size-2.5" />
                          </span>
                        ) : (
                          <span className="truncate max-w-[150px]">
                            {event.locationDetails}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
