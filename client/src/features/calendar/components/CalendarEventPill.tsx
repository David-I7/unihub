import { Bell, FileText, Pen, Video } from "lucide-react";
import type { CalendarEvent, EventType } from "../api/types";
import { cn } from "@/lib/utils";

interface CalendarEventPillProps {
  event: CalendarEvent;
  onClick: (event: CalendarEvent) => void;
  className?: string;
}

export function formatEventTime(isoDateStr?: string): string {
  if (!isoDateStr) return "";
  const d = new Date(isoDateStr);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export function getEventCategoryConfig(type: EventType) {
  switch (type) {
    case "EXAM":
      return {
        container:
          "bg-rose-500/15 text-rose-800 dark:text-rose-200 border-l-2 border-rose-500 hover:bg-rose-500/25",
        badge: "bg-rose-500 text-white",
        icon: Pen,
        label: "Exam",
      };
    case "ASSIGNMENT":
      return {
        container:
          "bg-amber-500/15 text-amber-800 dark:text-amber-200 border-l-2 border-amber-500 hover:bg-amber-500/25",
        badge: "bg-amber-500 text-white",
        icon: FileText,
        label: "Assignment",
      };
    case "LECTURE":
      return {
        container:
          "bg-blue-500/15 text-blue-800 dark:text-blue-200 border-l-2 border-blue-500 hover:bg-blue-500/25",
        badge: "bg-blue-500 text-white",
        icon: Video,
        label: "Lecture",
      };
  }
}

export function isEventCompleted(event: CalendarEvent): boolean {
  if (!event.startTime) return false;
  const d = new Date(event.startTime);
  return !isNaN(d.getTime()) && d.getTime() < Date.now();
}

export function CalendarEventPill({
  event,
  onClick,
  className,
}: CalendarEventPillProps) {
  const config = getEventCategoryConfig(event.type);
  const Icon = config.icon;
  const timeStr = formatEventTime(event.startTime);
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
