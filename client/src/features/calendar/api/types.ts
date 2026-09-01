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

export interface UserReminder {
  id: string;
  offsetMinutes: number;
  remindAt: string;
  status: ReminderStatus;
  eventId: string;
  eventTitle: string;
  eventType: EventType;
  eventStartTime: string;
  durationHours?: number;
  eventLocation?: EventLocation;
  courseSlug?: string;
  courseName?: string;
  courseAbbreviation?: string;
  communitySlug?: string;
  communityName?: string;
  studyYear?: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  type: EventType;
  startTime: string;
  durationHours?: number;
  location: EventLocation;
  courseAbbreviation?: string;
  isSubscribed: boolean;
}

export interface Event {
  id: string;
  title: string;
  type: EventType;
  startTime: string;
  durationHours?: number;
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
  durationHours?: number;
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
  durationHours?: number;
  location?: EventLocation;
  locationDetails?: string;
}

export interface CreateReminderPayload {
  offsetMinutes?: number; // default 15
}
