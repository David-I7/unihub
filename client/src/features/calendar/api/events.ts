import client from "@/api/client";
import { useAuthStore } from "@/features/auth";
import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import type {
  CalendarEvent,
  CalendarQueryParams,
  CreateEventPayload,
  Event,
  UpdateEventPayload,
} from "./types";

export const calendarKeys = {
  all: ["calendar"] as const,
  events: (params: CalendarQueryParams = {}) =>
    [...calendarKeys.all, "events", params] as const,
  detail: (id: string) => [...calendarKeys.all, "detail", id] as const,
};

export async function getEvents(
  params: CalendarQueryParams = {},
): Promise<CalendarEvent[]> {
  try {
    const response = await client.get<CalendarEvent[]>("/calendar", { params });
    if (Array.isArray(response.data)) {
      return response.data;
    }
    const dataObj = response.data as Record<string, unknown> | null | undefined;
    if (dataObj && Array.isArray(dataObj.content)) {
      return dataObj.content as CalendarEvent[];
    }
    if (dataObj && Array.isArray(dataObj.data)) {
      return dataObj.data as CalendarEvent[];
    }
    return [];
  } catch (error) {
    console.error("Failed to fetch calendar events:", error);
    return [];
  }
}

export async function getEventById(eventId: string): Promise<Event> {
  const response = await client.get<Event>(`/calendar/events/${eventId}`);
  return response.data;
}

export async function createEvent(
  payload: CreateEventPayload,
): Promise<CalendarEvent> {
  const response = await client.post<CalendarEvent>(
    "/calendar/events",
    payload,
  );
  return response.data;
}

export async function updateEvent(
  eventId: string,
  payload: UpdateEventPayload,
): Promise<CalendarEvent> {
  const response = await client.patch<CalendarEvent>(
    `/calendar/events/${eventId}`,
    payload,
  );
  return response.data;
}

export async function deleteEvent(eventId: string): Promise<void> {
  await client.delete(`/calendar/events/${eventId}`);
}

export function useCalendarEvents(
  params: CalendarQueryParams = {},
  options: { enabled?: boolean } = {},
) {
  const user = useAuthStore((state) => state.user);
  const { enabled = Boolean(user) } = options;
  return useQuery({
    queryKey: calendarKeys.events(params),
    queryFn: () => getEvents(params),
    placeholderData: keepPreviousData,
    enabled: enabled && Boolean(user),
  });
}

export function useCalendarEvent(
  eventId: string,
  options: { enabled?: boolean } = { enabled: true },
) {
  const user = useAuthStore((state) => state.user);
  const { enabled } = options;
  return useQuery<Event>({
    queryKey: calendarKeys.detail(eventId),
    queryFn: () => getEventById(eventId),
    enabled: enabled && Boolean(user) && eventId.length > 0,
  });
}

export function useCreateEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: calendarKeys.all });
    },
  });
}

export function useUpdateEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateEventPayload;
    }) => updateEvent(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: calendarKeys.all });
    },
  });
}

export function useDeleteEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: calendarKeys.all });
    },
  });
}
