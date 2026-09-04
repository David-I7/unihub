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
  keepPreviousData,
  type InfiniteData,
  type UseInfiniteQueryOptions,
} from "@tanstack/react-query";
import { calendarKeys, getQueryEventCache } from "./events";
import type {
  EventReminder,
  CreateReminderPayload,
  UserReminder,
  ReminderStatus,
} from "./types";
import queryClient from "@/lib/queryClient";

export const reminderKeys = {
  all: ["calendar", "reminders"] as const,
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

function updateUserRemindersCache(eventId: string) {
  const { previousEventsQueries, previousUpcomingQueries } =
    getQueryEventCache(eventId);

  // Invalidate current event detail query to ensure the new reminder is fetched
  if (import.meta.env.DEV) {
    console.log(
      `Invalidating event detail query for eventId=${eventId} due to reminder creation/deletion`,
    );
  }
  queryClient.invalidateQueries({
    queryKey: calendarKeys.detail(eventId),
  });

  // Remove cached upcoming events if reminder was created for that event
  for (const [key, upcomingQuery] of previousUpcomingQueries) {
    if (!upcomingQuery) continue;

    for (const upcomingEvent of upcomingQuery.pages) {
      for (const event of upcomingEvent.content) {
        if (event.id === eventId) {
          if (import.meta.env.DEV) {
            console.log(
              `Invalidating upcoming event query due to it containg the eventId=${eventId} for which a reminder was created/deleted`,
            );
          }
          queryClient.resetQueries({ queryKey: key });
          break;
        }
      }
    }
  }

  // Remove cached reminders list to ensure the new reminder is fetched
  if (import.meta.env.DEV) {
    console.log(`Invalidating reminders list query`);
  }
  queryClient.resetQueries({ queryKey: reminderKeys.all });

  // Remove cached calendar events list that contain the event for which the reminder was created
  for (const [key, eventList] of previousEventsQueries) {
    if (!eventList) continue;

    for (const event of eventList) {
      if (event.id === eventId) {
        if (import.meta.env.DEV) {
          console.log(
            `Invalidating calendar event query due to it containg the eventId=${eventId} for which a reminder was created/deleted`,
          );
        }
        queryClient.resetQueries({ queryKey: key });
        break;
      }
    }
  }
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
  return useMutation({
    mutationFn: ({
      eventId,
      payload,
    }: {
      eventId: string;
      payload?: CreateReminderPayload;
    }) => createReminder(eventId, payload),
    onSuccess: (data) => {
      updateUserRemindersCache(data.eventId);
    },
  });
}

export function useDeleteReminder() {
  return useMutation({
    mutationFn: (eventId: string) => deleteReminder(eventId),
    onSuccess: (_res, eventId) => {
      updateUserRemindersCache(eventId);
    },
  });
}
