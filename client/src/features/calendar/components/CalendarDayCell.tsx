import { Plus } from "lucide-react";
import type { CalendarEvent } from "../api/types";
import { useCalendarStore } from "../store/useCalendarStore";
import { CalendarEventPill } from "./CalendarEventPill";
import { cn } from "@/lib/utils";

interface CalendarDayCellProps {
  dayNumber: number;
  dateStr: string;
  isCurrentMonth: boolean;
  isToday: boolean;
  isWeekend: boolean;
  events: CalendarEvent[];
  borderRight?: boolean;
  canCreateEvent?: boolean;
}

export function CalendarDayCell({
  dayNumber,
  dateStr,
  isCurrentMonth,
  isToday,
  isWeekend,
  events,
  borderRight = true,
  canCreateEvent = true,
}: CalendarDayCellProps) {
  const openCreateModal = useCalendarStore((s) => s.openCreateModal);
  const openEventDetails = useCalendarStore((s) => s.openEventDetails);
  const openOverflowModal = useCalendarStore((s) => s.openOverflowModal);

  const maxVisible = 3;
  const visibleEvents = events.slice(0, maxVisible);
  const overflowCount = events.length - maxVisible;

  return (
    <div
      onClick={() => {
        if (canCreateEvent) openCreateModal(dateStr);
      }}
      className={cn(
        "group relative flex min-h-[115px] md:min-h-[135px] flex-col p-1.5 md:p-2 transition-colors select-none",
        canCreateEvent && "cursor-pointer",
        borderRight && "border-r",
        isCurrentMonth
          ? isWeekend
            ? "bg-card/70 dark:bg-card/40"
            : "bg-card"
          : "bg-muted/20 text-muted-foreground/50 opacity-60",
        "hover:bg-muted/40",
      )}
    >
      {/* Day Cell Header (Number + Quick Add Button) */}
      <div className="flex items-center justify-between">
        <span
          className={cn(
            "inline-flex size-6 items-center justify-center rounded-full text-xs font-semibold transition-all",
            isToday
              ? "bg-primary text-primary-foreground font-bold shadow-xs ring-2 ring-primary/30"
              : isCurrentMonth
                ? "text-foreground group-hover:text-primary"
                : "text-muted-foreground",
          )}
        >
          {dayNumber}
        </span>

        {/* Quick Add Button on Cell Hover */}
        {canCreateEvent && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              openCreateModal(dateStr);
            }}
            title={`Add event on ${dateStr}`}
            className="inline-flex size-5 items-center justify-center rounded text-muted-foreground opacity-0 transition-all group-hover:opacity-100 hover:bg-primary/15 hover:text-primary cursor-pointer"
          >
            <Plus className="size-3.5" />
          </button>
        )}
      </div>

      {/* Event Pills List */}
      <div className="mt-1.5 flex flex-1 flex-col gap-1">
        {visibleEvents.map((ev) => (
          <CalendarEventPill key={ev.id} event={ev} onClick={openEventDetails} />
        ))}

        {/* Overflow Badge */}
        {overflowCount > 0 && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              openOverflowModal(dateStr);
            }}
            className="mt-auto w-full rounded bg-primary/10 py-0.5 text-center text-[10px] font-semibold text-primary transition-colors hover:bg-primary/20 hover:underline cursor-pointer"
          >
            +{overflowCount} more...
          </button>
        )}
      </div>
    </div>
  );
}
