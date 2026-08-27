import { AlertCircle, FileText, Video } from "lucide-react";
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
        icon: AlertCircle,
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

export function CalendarEventPill({
  event,
  onClick,
  className,
}: CalendarEventPillProps) {
  const config = getEventCategoryConfig(event.type);
  const Icon = config.icon;
  const timeStr = formatEventTime(event.startTime);
  const abbreviation = event.courseAbbreviation?.trim() || "ABBV";

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick(event);
      }}
      className={cn(
        "group/pill flex w-full items-center gap-1 rounded-md px-1.5 py-0.5 text-left text-[11px] font-semibold leading-tight transition-all cursor-pointer shadow-2xs select-none truncate",
        config.container,
        className,
      )}
      title={`[${abbreviation}] ${event.title}${timeStr ? ` (${timeStr})` : ""}`}
    >
      <Icon className="size-2.5 shrink-0 opacity-80" />
      <span className="font-mono text-[10px] font-bold tracking-tight truncate">
        {abbreviation}
      </span>
    </button>
  );
}
