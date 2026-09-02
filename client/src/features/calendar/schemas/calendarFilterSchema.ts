import type { FilterSchema } from "@/hooks/useUrlFilters";
import type { EventType } from "../api/types";
import type { StudyYearNameDto } from "@/features/studyYears";

export interface CalendarUrlFilters {
  community: string;
  year: number;
  month: number;
  view: "auto" | "month" | "list";
  studyYear: StudyYearNameDto | "";
  course: string;
  type: EventType | "All";
  q: string;
}

export const CALENDAR_FILTER_SCHEMA: FilterSchema<CalendarUrlFilters> = {
  community: {
    type: "string",
    defaultValue: "",
    paramKey: "community",
  },
  year: {
    type: "number",
    defaultValue: new Date().getFullYear(),
    paramKey: "year",
  },
  month: {
    type: "number",
    defaultValue: new Date().getMonth() + 1,
    paramKey: "month",
  },
  view: {
    type: "enum",
    defaultValue: "auto",
    allowedValues: ["auto", "month", "list"] as const,
    paramKey: "view",
  },
  studyYear: {
    type: "string",
    defaultValue: "",
    paramKey: "studyYear",
  },
  course: {
    type: "string",
    defaultValue: "",
    paramKey: "course",
  },
  type: {
    type: "enum",
    defaultValue: "All",
    allowedValues: ["All", "EXAM", "ASSIGNMENT", "LECTURE"] as const,
    paramKey: "type",
  },
  q: {
    type: "string",
    defaultValue: "",
    paramKey: "q",
  },
};
