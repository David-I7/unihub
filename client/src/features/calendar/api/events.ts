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
  type QueryKey,
} from "@tanstack/react-query";
import type {
  CalendarEvent,
  CalendarQueryParams,
  CreateEventPayload,
  Event,
  UpdateEventPayload,
} from "./types";
import {
  rollbackOptimisticContext,
  updateQueryListItem,
  removeQueryListItem,
  updateInfiniteQueryItem,
  removeInfiniteQueryItem,
  patchDetailQuery,
  type OptimisticRollbackContext,
} from "@/lib/queryCacheUtils";
import { toTimeUnit } from "@/lib/dateUtils";

const UPCOMING_EVENTS_DAYS = 7;
const UPCOMING_EVENTS_DAYS_MS = toTimeUnit(
  UPCOMING_EVENTS_DAYS,
  "days",
  "milliseconds",
);

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
  reminders: () => [...calendarKeys.all, "reminders"] as const,
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

function isLessThanSevenDaysAway(startTime: string): boolean {
  const startMs = new Date(startTime).getTime();
  const sevenDaysFromNow = Date.now() + UPCOMING_EVENTS_DAYS_MS;
  return startMs <= sevenDaysFromNow;
}

export function useCreateEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createEvent,
    onSuccess: (data) => {
      if (isLessThanSevenDaysAway(data.startTime)) {
        queryClient.invalidateQueries({
          queryKey: calendarKeys.upcomingList(),
        });
      }

      queryClient.invalidateQueries({
        queryKey: calendarKeys.eventsList(),
      });
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

    onMutate: async ({
      id,
      payload,
    }): Promise<OptimisticRollbackContext<Event, unknown>> => {
      await queryClient.cancelQueries({ queryKey: calendarKeys.all });

      const detailKey = calendarKeys.detail(id);
      const previousDetail = queryClient.getQueryData<Event>(detailKey);

      const previousEventsQueries = queryClient.getQueriesData<CalendarEvent[]>(
        {
          queryKey: calendarKeys.eventsList(),
        },
      );
      const previousUpcomingQueries = queryClient.getQueriesData<
        InfiniteData<PaginatedResponse<CalendarEvent>>
      >({ queryKey: calendarKeys.upcomingList() });

      patchDetailQuery<Event>(queryClient, detailKey, (old) => ({
        ...old,
        ...payload,
      }));

      updateQueryListItem<CalendarEvent>(
        queryClient,
        calendarKeys.eventsList(),
        id,
        (event) => ({ ...event, ...payload }),
      );

      updateInfiniteQueryItem<CalendarEvent>(
        queryClient,
        calendarKeys.upcomingList(),
        id,
        (event) => ({ ...event, ...payload }),
      );

      return {
        previousDetail: [detailKey, previousDetail],
        previousQueries: [
          ...previousEventsQueries,
          ...previousUpcomingQueries,
        ] as [QueryKey, unknown][],
      };
    },

    onError: (_err, _vars, context) => {
      rollbackOptimisticContext(queryClient, context);
    },
  });
}

export function useDeleteEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteEvent,

    onMutate: async (
      eventId,
    ): Promise<OptimisticRollbackContext<Event, unknown>> => {
      await queryClient.cancelQueries({ queryKey: calendarKeys.all });

      const detailKey = calendarKeys.detail(eventId);
      const previousDetail = queryClient.getQueryData<Event>(detailKey);

      const previousEventsQueries = queryClient.getQueriesData<CalendarEvent[]>(
        {
          queryKey: calendarKeys.eventsList(),
        },
      );
      const previousUpcomingQueries = queryClient.getQueriesData<
        InfiniteData<PaginatedResponse<CalendarEvent>>
      >({ queryKey: calendarKeys.upcomingList() });

      removeQueryListItem<CalendarEvent>(
        queryClient,
        calendarKeys.eventsList(),
        eventId,
      );

      removeInfiniteQueryItem<CalendarEvent>(
        queryClient,
        calendarKeys.upcomingList(),
        eventId,
      );

      return {
        previousDetail: [detailKey, previousDetail],
        previousQueries: [
          ...previousEventsQueries,
          ...previousUpcomingQueries,
        ] as [QueryKey, unknown][],
      };
    },

    onError: (_err, _vars, context) => {
      rollbackOptimisticContext(queryClient, context);
    },

    onSuccess: (_, eventId) => {
      queryClient.removeQueries({ queryKey: calendarKeys.detail(eventId) });
      queryClient.invalidateQueries({ queryKey: calendarKeys.reminders() });
    },
  });
}

export async function getUpcomingEvents(
  params: { days?: number; page?: number; size?: number } = {},
): Promise<PaginatedResponse<CalendarEvent>> {
  const { days = UPCOMING_EVENTS_DAYS, page = 0, size = 5 } = params;
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
  const { days = UPCOMING_EVENTS_DAYS, size = 5 } = params;

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
