import client from "@/api/client";
import {
  getPaginatedNextPageParam,
  getPaginatedPrevPageParam,
  type PaginatedResponse,
} from "@/api/types";
import { useAuthStore } from "@/features/auth";
import {
  useQuery,
  useInfiniteQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
  type InfiniteData,
  type UseInfiniteQueryOptions,
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
  upcoming: (params: { days?: number; size?: number } = {}) =>
    [...calendarKeys.all, "upcoming", params] as const,
  detail: (id: string) => [...calendarKeys.all, "detail", id] as const,
};

export async function getEvents(
  params: CalendarQueryParams = {},
): Promise<CalendarEvent[]> {
  const response = await client.get<CalendarEvent[]>("/calendar", { params });
  return response.data;
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
    }) => {
      queryClient.setQueryData<Event | undefined>(
        calendarKeys.detail(id),
        (oldEvent) => {
          if (!oldEvent) return oldEvent;
          return { ...oldEvent, ...payload };
        },
      );

      return updateEvent(id, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: calendarKeys.events() });
      queryClient.invalidateQueries({ queryKey: calendarKeys.upcoming() });
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

export async function getUpcomingEvents(
  params: { days?: number; page?: number; size?: number } = {},
): Promise<PaginatedResponse<CalendarEvent>> {
  const { days = 7, page = 0, size = 5 } = params;
  const response = await client.get<PaginatedResponse<CalendarEvent>>(
    "/calendar/upcoming",
    { params: { days, page, size } },
  );
  return response.data;
}

export function useInfiniteUpcomingEvents(
  params: { days?: number; size?: number } = {},
  options?: Omit<
    UseInfiniteQueryOptions<
      PaginatedResponse<CalendarEvent>,
      Error,
      InfiniteData<PaginatedResponse<CalendarEvent>>,
      ReturnType<typeof calendarKeys.upcoming>,
      number
    >,
    | "queryKey"
    | "queryFn"
    | "initialPageParam"
    | "getNextPageParam"
    | "getPreviousPageParam"
  >,
) {
  const user = useAuthStore((state) => state.user);
  const { days = 7, size = 5 } = params;

  return useInfiniteQuery({
    queryKey: calendarKeys.upcoming({ days, size }),
    queryFn: ({ pageParam }) =>
      getUpcomingEvents({
        days,
        page: pageParam,
        size,
      }),
    initialPageParam: 0,
    getNextPageParam: getPaginatedNextPageParam,
    getPreviousPageParam: getPaginatedPrevPageParam,
    enabled: Boolean(user),
    placeholderData: keepPreviousData,
    ...options,
  });
}
