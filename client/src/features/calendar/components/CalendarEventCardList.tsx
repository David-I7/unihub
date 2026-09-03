import { Badge } from "@/components/ui/badge";
import type { CalendarEvent } from "../api/types";
import { CalendarEventCard } from "./CalendarEventCard";

interface CalendarEventCardListProps {
  groupedEvents: {
    dateStr: string;
    events: CalendarEvent[];
    weekday: string;
    formattedDate: string;
    isToday: boolean;
  }[];
  onEventClick: (eventId: string) => void;
}

export default function CalendarEventCardList({
  groupedEvents,
  onEventClick,
}: CalendarEventCardListProps) {
  return groupedEvents.map((group) => (
    <div key={group.dateStr} className="space-y-3">
      {/* Day Header with Sticky-friendly style */}
      <div className="flex items-center justify-between gap-3 px-1">
        <div className="flex items-center gap-2.5">
          <span className="text-sm">
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
        {group.events.map((event) => (
          <CalendarEventCard
            key={event.id}
            event={event}
            onClick={() => onEventClick(event.id)}
            formattedDate={group.formattedDate}
          />
        ))}
      </div>
    </div>
  ));
}
