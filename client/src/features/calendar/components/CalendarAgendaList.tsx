import { useMemo } from "react";
import { Calendar as CalendarIcon } from "lucide-react";
import type { CalendarEvent } from "../api/types";
import { useCalendarStore } from "../store/useCalendarStore";
import { formatDayHeader, getLocalDateKey } from "@/lib/dateUtils";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { CalendarEventCard } from "./CalendarEventCard";

interface CalendarAgendaListProps {
  currentDate: Date;
  events: CalendarEvent[];
}

export function CalendarAgendaList({ currentDate, events }: CalendarAgendaListProps) {
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
                  group.isToday
                    ? "text-primary font-extrabold"
                    : "text-foreground",
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
              {group.events.length}{" "}
              {group.events.length === 1 ? "event" : "events"}
            </span>
          </div>

          {/* Events List for this Day */}
          <div className="space-y-3">
            {group.events.map((event) => (
              <CalendarEventCard
                key={event.id}
                event={event}
                onClick={() => openEventDetails(event.id)}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
