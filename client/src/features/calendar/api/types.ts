export type EventType = "EXAM" | "LECTURE" | "ASSIGNMENT";
export type EventLocation = "IN_PERSON" | "ONLINE" | "HYBRID";
export type ReminderStatus = "PENDING" | "SENT" | "CANCELLED";

export interface EventReminder {
  id: string;
  eventId: string;
  offsetMinutes: number;
  remindAt: string;
  status: ReminderStatus;
  createdAt: string;
}

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
  courseAbbreviation?: string;
  communitySlug: string;
  createdAt: string;
  updatedAt: string;
  owner?: { id: string; username: string };
  isSubscribed: boolean;
  reminders: EventReminder[];
}

export interface CalendarQueryParams {
  year?: number;
  month?: number; // 1-12
  communitySlug?: string;
  studyYear?: "year-1" | "year-2" | "year-3" | "year-4" | string;
  studyYearName?: string;
  courseSlug?: string;
  type?: EventType;
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
