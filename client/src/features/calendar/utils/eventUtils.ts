import { createElement } from "react";
import { FileText, Globe, Layers, MapPin, Pen, Video, type LucideIcon } from "lucide-react";
import type { EventLocation, EventType } from "../api/types";

export interface EventCategoryConfig {
  container: string;
  pillContainer: string;
  badge: string;
  icon: LucideIcon;
  label: string;
  dotColor: string;
}

export const EVENT_TYPE_OPTIONS: {
  value: EventType;
  label: string;
  icon: LucideIcon;
  colorClass: string;
}[] = [
  {
    value: "EXAM",
    label: "Exam",
    icon: Pen,
    colorClass: "text-purple-600 dark:text-purple-400",
  },
  {
    value: "ASSIGNMENT",
    label: "Assignment",
    icon: FileText,
    colorClass: "text-amber-600 dark:text-amber-400",
  },
  {
    value: "LECTURE",
    label: "Lecture",
    icon: Video,
    colorClass: "text-blue-600 dark:text-blue-400",
  },
];

export const EVENT_LOCATION_OPTIONS: {
  value: EventLocation;
  label: string;
  icon: LucideIcon;
}[] = [
  { value: "IN_PERSON", label: "In-Person", icon: MapPin },
  { value: "ONLINE", label: "Online", icon: Globe },
  { value: "HYBRID", label: "Hybrid", icon: Layers },
];

export function formatEventLocation(
  location?: EventLocation | string | null,
): string {
  if (!location) return "";
  switch (location) {
    case "IN_PERSON":
      return "In-Person";
    case "ONLINE":
      return "Online";
    case "HYBRID":
      return "Hybrid";
    default:
      return location;
  }
}

export function getEventLocationIcon(
  location?: EventLocation | string | null,
): LucideIcon {
  switch (location) {
    case "ONLINE":
      return Globe;
    case "HYBRID":
      return Layers;
    case "IN_PERSON":
    default:
      return MapPin;
  }
}

export function EventLocationIcon({
  location,
  className,
}: {
  location?: EventLocation | string | null;
  className?: string;
}) {
  const Icon = getEventLocationIcon(location);
  return createElement(Icon, { className });
}

export function getEventCategoryConfig(type: EventType): EventCategoryConfig {
  switch (type) {
    case "EXAM":
      return {
        container:
          "bg-purple-500/10 text-purple-800 dark:text-purple-200 border-l-3 border-purple-500 hover:bg-purple-500/20",
        pillContainer:
          "bg-purple-500/15 text-purple-950 dark:text-purple-200 border-purple-500/30 hover:bg-purple-500/25 hover:border-purple-500/50",
        badge:
          "bg-purple-500/15 text-purple-700 dark:text-purple-300 border border-purple-500/30",
        icon: Pen,
        label: "Exam",
        dotColor: "bg-purple-500",
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
