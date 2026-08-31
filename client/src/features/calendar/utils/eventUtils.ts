import { FileText, Pen, Video, type LucideIcon } from "lucide-react";
import type { CalendarEvent, EventType } from "../api/types";

export interface EventCategoryConfig {
  container: string;
  pillContainer: string;
  badge: string;
  icon: LucideIcon;
  label: string;
  dotColor: string;
}

export function getEventCategoryConfig(type: EventType): EventCategoryConfig {
  switch (type) {
    case "EXAM":
      return {
        container:
          "bg-rose-500/10 text-rose-800 dark:text-rose-200 border-l-3 border-rose-500 hover:bg-rose-500/20",
        pillContainer:
          "bg-rose-500/15 text-rose-950 dark:text-rose-200 border-rose-500/30 hover:bg-rose-500/25 hover:border-rose-500/50",
        badge:
          "bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/30",
        icon: Pen,
        label: "Exam",
        dotColor: "bg-rose-500",
      };
    case "ASSIGNMENT":
      return {
        container:
          "bg-amber-500/10 text-amber-800 dark:text-amber-200 border-l-3 border-amber-500 hover:bg-amber-500/20",
        pillContainer:
          "bg-amber-500/15 text-amber-950 dark:text-amber-200 border-amber-500/30 hover:bg-amber-500/25 hover:border-amber-500/50",
        badge:
          "bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30",
        icon: FileText,
        label: "Assignment",
        dotColor: "bg-amber-500",
      };
    case "LECTURE":
      return {
        container:
          "bg-blue-500/10 text-blue-800 dark:text-blue-200 border-l-3 border-blue-500 hover:bg-blue-500/20",
        pillContainer:
          "bg-blue-500/15 text-blue-950 dark:text-blue-200 border-blue-500/30 hover:bg-blue-500/25 hover:border-blue-500/50",
        badge:
          "bg-blue-500/15 text-blue-700 dark:text-blue-300 border border-blue-500/30",
        icon: Video,
        label: "Lecture",
        dotColor: "bg-blue-500",
      };
  }
}

export function isEventCompleted(event: CalendarEvent): boolean {
  if (!event.startTime) return false;
  const d = new Date(event.startTime);
  return !isNaN(d.getTime()) && d.getTime() < Date.now();
}
