import client from "@/api/client";
import {
  getPaginatedNextPageParam,
  getPaginatedPrevPageParam,
  type PaginatedResponse,
} from "@/api/types";
import { useAuthStore } from "@/features/auth";
import {
  useMutation,
  useInfiniteQuery,
  useQueryClient,
  keepPreviousData,
  type InfiniteData,
  type UseInfiniteQueryOptions,
} from "@tanstack/react-query";
import { calendarKeys } from "./events";
import type {
  CalendarEvent,
  Event,
  EventReminder,
  CreateReminderPayload,
  UserReminder,
  ReminderStatus,
} from "./types";
import {
  updateQueryListItem,
  updateInfiniteQueryItem,
  patchDetailQuery,
} from "@/lib/queryCacheUtils";

export const reminderKeys = {
  all: calendarKeys.reminders(),
  lists: () => [...reminderKeys.all, "list"] as const,
  list: (params: { status?: ReminderStatus; size?: number } = {}) =>
    [...reminderKeys.lists(), params] as const,
};

export async function createReminder(
  eventId: string,
  payload: CreateReminderPayload = {},
): Promise<EventReminder> {
  const response = await client.post<EventReminder>(
    `/calendar/events/${eventId}/reminders`,
    payload,
  );
  return response.data;
}

export async function deleteReminder(eventId: string): Promise<void> {
  await client.delete(`/calendar/events/${eventId}/reminders`);
}

export async function getUserReminders(
  params: { status?: ReminderStatus; page?: number; size?: number } = {},
): Promise<PaginatedResponse<UserReminder>> {
  const { status = "PENDING", page = 0, size = 5 } = params;
  const response = await client.get<PaginatedResponse<UserReminder>>(
    "/calendar/reminders",
    { params: { status, page, size } },
  );
  return response.data;
}

export function useInfiniteUserReminders(
  params: { status?: ReminderStatus; size?: number } = {},
  options?: Omit<
    UseInfiniteQueryOptions<
      PaginatedResponse<UserReminder>,
      Error,
      InfiniteData<PaginatedResponse<UserReminder>>,
      ReturnType<typeof reminderKeys.list>,
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
  const { status = "PENDING", size = 5 } = params;

  return useInfiniteQuery({
    queryKey: reminderKeys.list({ status, size }),
    queryFn: ({ pageParam }) =>
      getUserReminders({
        status,
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

export function useCreateReminder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      eventId,
      payload,
    }: {
      eventId: string;
      payload?: CreateReminderPayload;
    }) => createReminder(eventId, payload),
    onSuccess: (data) => {
      updateQueryListItem<CalendarEvent>(
        queryClient,
        calendarKeys.eventsList(),
        data.eventId,
        (ev) => ({ ...ev, isSubscribed: true }),
      );

      updateInfiniteQueryItem<CalendarEvent>(
        queryClient,
        calendarKeys.upcomingList(),
        data.eventId,
        (ev) => ({ ...ev, isSubscribed: true }),
      );

      patchDetailQuery<Event>(
        queryClient,
        calendarKeys.detail(data.eventId),
        (old) => ({
          ...old,
          reminders: [data],
        }),
      );

      queryClient.invalidateQueries({ queryKey: reminderKeys.all });
    },
  });
}

export function useDeleteReminder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (eventId: string) => deleteReminder(eventId),
    onSuccess: (_res, eventId) => {
      updateQueryListItem<CalendarEvent>(
        queryClient,
        calendarKeys.eventsList(),
        eventId,
        (ev) => ({ ...ev, isSubscribed: false }),
      );

      updateInfiniteQueryItem<CalendarEvent>(
        queryClient,
        calendarKeys.upcomingList(),
        eventId,
        (ev) => ({ ...ev, isSubscribed: false }),
      );

      patchDetailQuery<Event>(
        queryClient,
        calendarKeys.detail(eventId),
        (old) => ({
          ...old,
          reminders: [],
        }),
      );

      queryClient.invalidateQueries({ queryKey: reminderKeys.all });
    },
  });
}
