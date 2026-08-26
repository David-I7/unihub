import client from "@/api/client";
import type { CalendarEvent, CalendarQueryParams } from "./types";
import { useQuery, keepPreviousData } from "@tanstack/react-query";

export async function getEvents(
  params: CalendarQueryParams = {},
): Promise<CalendarEvent[]> {
  const response = await client.get<CalendarEvent[]>("/calendar", {
    params,
  });
  return response.data;
}

export const calendarKeys = {
  all: ["calendar"] as const,
  events: (params: CalendarQueryParams = {}) =>
    [...calendarKeys.all, "events", params] as const,
};

export function useCalendarEvents(
  params: CalendarQueryParams = {},
  options: { enabled?: boolean } = {},
) {
  const { enabled = true } = options;

  return useQuery({
    queryKey: calendarKeys.events(params),
    queryFn: () => getEvents(params),
    placeholderData: keepPreviousData,
    enabled,
  });
}
