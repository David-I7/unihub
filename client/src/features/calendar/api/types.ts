import type { ResourceOwner } from "@/features/communities/api/types";
import type {
  StudyYearName,
  StudyYearNameDto,
} from "@/features/studyYears/api/types";

export type EventType = "EXAM" | "LECTURE" | "ASSIGNMENT";
export type EventLocation = "IN_PERSON" | "ONLINE" | "HYBRID";
export type ReminderStatus = "PENDING" | "SENT" | "CANCELLED";

export interface EventReminder {
  id: string;
  eventId: string;
  offsetMinutes: number;
  remindAt: string;
  status: ReminderStatus;
}

export interface CalendarEvent {
  id: string;
  title: string;
  type: EventType;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  location: EventLocation;
  courseSlug: string;
  courseName: string;
  courseAbbreviation: string;
  communitySlug: string;
  communityName: string;
  studyYear: StudyYearName;
  isSubscribed: boolean;
}

export interface Event {
  id: string;
  title: string;
  type: EventType;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  location: EventLocation;
  locationDetails?: string;
  description?: string;
  courseSlug: string;
  courseName: string;
  courseAbbreviation: string;
  communitySlug: string;
  communityName: string;
  studyYear: StudyYearName;
  owner: ResourceOwner;
  reminders: EventReminder[];
}

export interface CalendarQueryParams {
  year?: number;
  month?: number;
  communitySlug?: string;
  studyYearName?: StudyYearNameDto;
  courseSlug?: string;
}

export interface CreateEventPayload {
  title: string;
  description?: string;
  type: EventType;
  startTime: string; // ISO 8601
  endTime?: string; // ISO 8601
  durationMinutes?: number;
  location: EventLocation;
  locationDetails?: string;
  courseId: number;
  communitySlug: string;
}

export interface UpdateEventPayload {
  title?: string;
  description?: string;
  type?: EventType;
  startTime?: string;
  endTime?: string;
  durationMinutes?: number;
  location?: EventLocation;
  locationDetails?: string;
}

export interface CreateReminderPayload {
  offsetMinutes?: number; // default 15
}
