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
  EventReminder,
  CreateReminderPayload,
  UserReminder,
  ReminderStatus,
} from "./types";

export const reminderKeys = {
  all: ["calendar", "reminders"] as const,
  list: (params: { status?: ReminderStatus; size?: number } = {}) =>
    [...reminderKeys.all, "list", params] as const,
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: calendarKeys.all });
      queryClient.invalidateQueries({ queryKey: reminderKeys.all });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

export function useDeleteReminder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (eventId: string) => deleteReminder(eventId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: calendarKeys.all });
      queryClient.invalidateQueries({ queryKey: reminderKeys.all });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}
