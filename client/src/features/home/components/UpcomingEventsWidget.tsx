import { useMemo } from "react";
import { Link } from "react-router";
import { Calendar, ArrowRight, Sparkles } from "@/components/ui/icons";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  useInfiniteUpcomingEvents,
  useCalendarStore,
  CalendarEventCard,
  EventDetailModal,
  EventFormModal,
  type CalendarEvent,
} from "@/features/calendar";
import { formatDayHeader, getLocalDateKey } from "@/lib/dateUtils";
import { cn } from "@/lib/utils";

export function UpcomingEventsWidget() {
  const {
    data,
    isLoading,
    isError,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    refetch,
  } = useInfiniteUpcomingEvents({ days: 7, size: 5 });

  const openEventDetails = useCalendarStore((s) => s.openEventDetails);

  const events: CalendarEvent[] =
    data?.pages.flatMap((page) => page.content) ?? [];

  const groupedEvents = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();

    for (const ev of events) {
      const d = new Date(ev.startTime);
      if (isNaN(d.getTime())) continue;
      const key = getLocalDateKey(d);
      if (!map.has(key)) {
        map.set(key, []);
      }
      map.get(key)!.push(ev);
    }

    // Sort days chronologically
    const sortedKeys = Array.from(map.keys()).sort();

    return sortedKeys.map((key) => {
      const dayEvents = map.get(key)!;
      dayEvents.sort(
        (a, b) =>
          new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
      );
      return {
        dateStr: key,
        events: dayEvents,
        ...formatDayHeader(key),
      };
    });
  }, [events]);

  return (
    <>
      <Card className="rounded-2xl border bg-card p-5 space-y-4 shadow-xs">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 pb-1 border-b border-border/60">
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Calendar className="size-4" />
            </div>
            <div>
              <h2 className="font-heading text-base font-bold text-foreground">
                Upcoming Events
              </h2>
              <p className="text-[11px] text-muted-foreground">Next 7 days</p>
            </div>
          </div>

          <Link
            to="/calendar"
            className="text-xs font-semibold text-primary hover:underline flex items-center gap-1 shrink-0 group"
          >
            <span>View calendar</span>
            <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        {/* Body */}
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 2 }).map((_, dayIdx) => (
              <div key={dayIdx} className="space-y-3">
                <div className="flex items-center justify-between px-1">
                  <div className="h-4 w-28 bg-muted rounded-md animate-pulse" />
                  <div className="h-4 w-16 bg-muted rounded-md animate-pulse" />
                </div>
                <div className="space-y-2.5">
                  {Array.from({ length: 2 }).map((_, cardIdx) => (
                    <div
                      key={cardIdx}
                      className="p-4 rounded-2xl border bg-card animate-pulse space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="h-4 w-20 bg-muted rounded-md" />
                        <div className="h-4 w-24 bg-muted rounded-md" />
                      </div>
                      <div className="h-4 w-3/4 bg-muted rounded-md" />
                      <div className="h-3 w-1/2 bg-muted rounded-md" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : isError ? (
          <div className="py-6 text-center space-y-2">
            <p className="text-xs text-destructive font-medium">
              Failed to load upcoming events.
            </p>
            <Button
              variant="outline"
              size="xs"
              onClick={() => refetch()}
              className="cursor-pointer"
            >
              Retry
            </Button>
          </div>
        ) : events.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 px-4 text-center rounded-xl border border-dashed border-border/70 bg-muted/10 space-y-2">
            <div className="size-9 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
              <Sparkles className="size-4" />
            </div>
            <p className="text-xs font-medium text-foreground">
              No events in the next 7 days
            </p>
            <p className="text-[11px] text-muted-foreground max-w-xs leading-relaxed">
              You're all caught up. New exams, assignments, or lectures in your
              communities will show up here.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {groupedEvents.map((group) => (
              <div key={group.dateStr} className="space-y-3">
                {/* Day Header with Date & Event Count */}
                <div className="flex items-center justify-between gap-3 px-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "font-heading text-xs font-bold uppercase tracking-wider",
                        group.isToday
                          ? "text-primary font-extrabold"
                          : "text-foreground",
                      )}
                    >
                      {group.weekday}, {group.formattedDate}
                    </span>

                    {group.isToday && (
                      <Badge
                        variant="default"
                        className="h-4 px-1.5 text-[9px] font-bold uppercase tracking-wider bg-primary text-primary-foreground shadow-xs"
                      >
                        Today
                      </Badge>
                    )}
                  </div>

                  <span className="text-[11px] text-muted-foreground font-medium">
                    {group.events.length}{" "}
                    {group.events.length === 1 ? "event" : "events"}
                  </span>
                </div>

                {/* Events list for this day with community context */}
                <div className="space-y-2.5">
                  {group.events.map((event) => (
                    <CalendarEventCard
                      key={event.id}
                      event={event}
                      showCommunity={true}
                      onClick={() => openEventDetails(event.id)}
                    />
                  ))}
                </div>
              </div>
            ))}

            {/* Load More Button */}
            {hasNextPage && (
              <div className="pt-2 flex justify-center">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => fetchNextPage()}
                  disabled={isFetchingNextPage}
                  className="w-full text-xs font-semibold text-muted-foreground hover:text-foreground cursor-pointer gap-1.5"
                >
                  {isFetchingNextPage ? (
                    <>
                      <Spinner className="size-3.5" />
                      <span>Loading more...</span>
                    </>
                  ) : (
                    <span>See more upcoming events</span>
                  )}
                </Button>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Modals for detailed event viewing and editing */}
      <EventDetailModal />
      <EventFormModal />
    </>
  );
}
