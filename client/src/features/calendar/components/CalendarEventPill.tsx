import { Bell } from "lucide-react";
import type { CalendarEvent } from "../api/types";
import { cn } from "@/lib/utils";
import { formatTime } from "@/lib/dateUtils";
import { getEventCategoryConfig, isEventCompleted } from "../utils/eventUtils";

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
  const Icon = config.icon;
  const timeStr = formatTime(event.startTime);
  const abbreviation = event.courseAbbreviation?.trim() || "ABBV";
  const hasActiveReminder = event.isSubscribed && !isEventCompleted(event);

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick(event);
      }}
      className={cn(
        "group/pill flex w-full items-center justify-between gap-1.5 rounded-md px-2 py-1 min-h-[24px] text-left text-[11px] font-medium leading-tight transition-all cursor-pointer shadow-2xs select-none",
        config.container,
        className,
      )}
      title={`[${abbreviation}] ${event.title}${timeStr ? ` (${timeStr})` : ""}`}
    >
      <div className="flex items-center gap-1.5 min-w-0 flex-1 truncate">
        <Icon className="size-3 shrink-0 opacity-80" />
        <span className="font-mono text-[10px] font-bold tracking-tight shrink-0">
          [{abbreviation}]
        </span>
        <span className="truncate opacity-90 text-[11px] font-medium">
          {event.title}
        </span>
      </div>

      {hasActiveReminder && (
        <Bell className="size-2.5 shrink-0 fill-current opacity-85 ml-1" />
      )}
    </button>
  );
}
