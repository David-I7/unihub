import client from "@/api/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { calendarKeys } from "./events";
import type { EventReminder, CreateReminderPayload } from "./types";

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
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}
