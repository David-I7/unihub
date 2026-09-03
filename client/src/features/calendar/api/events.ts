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
import queryClient from "@/lib/queryClient";

export const calendarKeys = {
  all: ["calendar"] as const,
  eventsList: () => [...calendarKeys.all, "events"] as const,
  events: (params: CalendarQueryParams) =>
    [...calendarKeys.eventsList(), params] as const,
  upcomingList: () => [...calendarKeys.all, "upcoming"] as const,
  upcoming: (params: { days?: number; size?: number } = {}) =>
    [...calendarKeys.upcomingList(), params] as const,
  detailList: () => [...calendarKeys.all, "detail"] as const,
  detail: (id: string) => [...calendarKeys.detailList(), id] as const,
};

export async function getEvents(
  params: CalendarQueryParams,
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
  params: CalendarQueryParams,
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
    onSuccess: (data, createPayload) => {
      // Invalidate upcoming events if the new event is within the next 7 days
      const startMs = new Date(data.startTime).getTime();
      const sevenDaysFromNow = Date.now() + 7 * 24 * 60 * 60 * 1000;
      if (startMs <= sevenDaysFromNow) {
        if (import.meta.env.DEV) {
          console.log(
            "Invalidating upcoming events due to new event within 7 days",
          );
        }
        queryClient.invalidateQueries({
          queryKey: calendarKeys.upcomingList(),
        });
      }

      // Invalidate only the events list queries whose date range contains the new event
      const eventsCache = queryClient.getQueriesData<CalendarEvent[]>({
        queryKey: calendarKeys.eventsList(),
      });

      for (const [key] of eventsCache) {
        const shouldInvalidate = key.some((k) => {
          if (typeof k === "object" && k !== null) {
            if (!("year" in k) || !("month" in k)) {
              return false;
            }

            const { year, month, communitySlug } = k as CalendarQueryParams;
            const eventStart = new Date(data.startTime).getTime();
            const rangeStart = new Date(year, month - 1, 1).getTime();
            const rangeEnd = new Date(year, month, 0).getTime();
            const isInRange =
              eventStart >= rangeStart && eventStart <= rangeEnd;

            return isInRange && createPayload.communitySlug === communitySlug;
          }
          return false;
        });
        if (shouldInvalidate) {
          if (import.meta.env.DEV) {
            console.log(
              `Invalidating key: ${JSON.stringify(key)} events list due to new event`,
            );
          }
          queryClient.invalidateQueries({ queryKey: key });
          break;
        }
      }
    },
  });
}

interface UpdateContext {
  previousDetail: Event | undefined;
  previousEventsQueries: [readonly unknown[], CalendarEvent[] | undefined][];
  previousUpcomingQueries: [
    readonly unknown[],
    InfiniteData<PaginatedResponse<CalendarEvent>> | undefined,
  ][];
}

const getQueryEventCache = (eventId: string) => {
  const detailKey = calendarKeys.detail(eventId);
  const detail = queryClient.getQueryData<Event>(detailKey);

  const eventsCache = queryClient.getQueriesData<CalendarEvent[]>({
    queryKey: calendarKeys.eventsList(),
  });

  // Snapshot all upcoming paginated queries
  const upcomingCache = queryClient.getQueriesData<
    InfiniteData<PaginatedResponse<CalendarEvent>>
  >({ queryKey: calendarKeys.upcomingList() });

  return {
    previousDetail: detail,
    previousEventsQueries: eventsCache,
    previousUpcomingQueries: upcomingCache,
  };
};

const optimisticEventUpdate = async (
  eventId: string,
  payload: UpdateEventPayload,
) => {
  await queryClient.cancelQueries({ queryKey: calendarKeys.all });

  // Snapshot the current detail query
  const { previousDetail, previousEventsQueries, previousUpcomingQueries } =
    getQueryEventCache(eventId);

  if (previousDetail) {
    // Optimistically update the detail query
    queryClient.setQueryData<Event>(calendarKeys.detail(eventId), {
      ...previousDetail,
      ...payload,
    });
  }

  // Optimistically update every events list query
  for (const [key] of previousEventsQueries) {
    queryClient.setQueryData<CalendarEvent[]>(key, (old) => {
      if (!old) return old;

      return old.map((event) =>
        event.id === eventId ? { ...event, ...payload } : event,
      );
    });
  }

  // Optimistically update every upcoming paginated query
  for (const [key] of previousUpcomingQueries) {
    queryClient.setQueryData<InfiniteData<PaginatedResponse<CalendarEvent>>>(
      key,
      (old) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            content: page.content.map((event) =>
              event.id === eventId && payload
                ? { ...event, ...payload }
                : event,
            ),
          })),
        };
      },
    );
  }
  return { previousDetail, previousEventsQueries, previousUpcomingQueries };
};

const onDeleteSuccess = async (eventId: string) => {
  await queryClient.cancelQueries({ queryKey: calendarKeys.all });

  const { previousEventsQueries, previousUpcomingQueries } =
    getQueryEventCache(eventId);

  // Remove the event from the detail query
  queryClient.removeQueries({ queryKey: calendarKeys.detail(eventId) });

  // Remove the event from every events list query
  for (const [key] of previousEventsQueries) {
    queryClient.setQueryData<CalendarEvent[]>(key, (old) => {
      if (!old) return old;
      return old.filter((event) => event.id !== eventId);
    });
  }
  // Remove the event from every upcoming paginated query
  for (const [key] of previousUpcomingQueries) {
    queryClient.setQueryData<InfiniteData<PaginatedResponse<CalendarEvent>>>(
      key,
      (old) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            content: page.content.filter((event) => event.id !== eventId),
          })),
        };
      },
    );
  }
};

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

    onMutate: async ({ id, payload }): Promise<UpdateContext> => {
      return optimisticEventUpdate(id, payload);
    },

    onError: (_err, { id }, context) => {
      if (context) {
        queryClient.setQueryData(
          calendarKeys.detail(id),
          context.previousDetail,
        );

        // Roll back all events list queries
        for (const [key, data] of context.previousEventsQueries) {
          queryClient.setQueryData(key, data);
        }

        // Roll back all upcoming paginated queries
        for (const [key, data] of context.previousUpcomingQueries) {
          queryClient.setQueryData(key, data);
        }
      }
    },
  });
}

export function useDeleteEvent() {
  return useMutation({
    mutationFn: deleteEvent,
    onSuccess: (_, eventId) => {
      onDeleteSuccess(eventId);
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
