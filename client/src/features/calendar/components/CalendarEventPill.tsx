import { Bell } from "lucide-react";
import type { CalendarEvent } from "../api/types";
import { cn } from "@/lib/utils";
import { getEventCategoryConfig } from "../utils/eventUtils";

interface CalendarEventPillProps {
  event: CalendarEvent;
  onClick: (event: CalendarEvent) => void;
  className?: string;
}

export function CalendarEventPill({
  event,
  onClick,
  className,
}: CalendarEventPillProps) {
  const config = getEventCategoryConfig(event.type);
  const abbreviation = event.courseAbbreviation?.trim();
  const hasActiveReminder = Boolean(event.isSubscribed);

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick(event);
      }}
      className={cn(
        "group/pill flex w-full items-center justify-between gap-1.5 rounded-lg px-2 py-1 min-h-[26px] text-left text-[11px] font-medium leading-tight transition-all duration-150 cursor-pointer shadow-2xs select-none border",
        config.pillContainer,
        className,
      )}
    >
      <div className="flex items-center gap-1.5 min-w-0 flex-1 truncate">
        {/* Course Code Abbreviation (if present) */}
        {abbreviation && (
          <span className="font-mono text-[10px] font-bold opacity-90 shrink-0">
            [{abbreviation}]
          </span>
        )}

        {/* Event Title */}
        <span className="truncate text-[11px] font-semibold">
          {event.title}
        </span>
      </div>

      {/* Subscription Bell */}
      {hasActiveReminder && (
        <Bell className="size-2.5 shrink-0 fill-current opacity-90 ml-1 text-amber-600 dark:text-amber-400" />
      )}
    </button>
  );
}
