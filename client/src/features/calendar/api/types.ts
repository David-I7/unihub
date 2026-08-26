import type { ResourceOwner } from "@/types/domain";

export type EventType = "EXAM" | "LECTURE" | "ASSIGNMENT";
export type EventLocation = "IN_PERSON" | "ONLINE";

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  type: EventType;
  startTime: string;
  endTime?: string;
  durationMinutes?: number;
  location: EventLocation;
  locationDetails?: string;
  courseId: number;
  courseSlug: string;
  courseName: string;
  communitySlug: string;
  createdAt: string;
  updatedAt: string;
  owner: ResourceOwner;
  isSubscribed: boolean;
}

export interface CalendarQueryParams {
  communitySlug?: string;
  courseSlug?: string;
  studyYearName?: string;
  type?: EventType;
  from?: string;
  to?: string;
}
