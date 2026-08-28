import { FileText, Pen, Video, type LucideIcon } from "lucide-react";
import type { CalendarEvent, EventType } from "../api/types";

export interface EventCategoryConfig {
  container: string;
  badge: string;
  icon: LucideIcon;
  label: string;
}

export function getEventCategoryConfig(type: EventType): EventCategoryConfig {
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
