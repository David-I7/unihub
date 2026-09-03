import { useMemo } from "react";
import { Calendar as CalendarIcon, Sparkles } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";
import {
  useInfiniteUpcomingEvents,
  useCalendarStore,
  type CalendarEvent,
} from "@/features/calendar";
import { formatDayHeader, getLocalDateKey } from "@/lib/dateUtils";
import CalendarEventCardList from "@/features/calendar/components/CalendarEventCardList";

interface AllUpcomingEventsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AllUpcomingEventsModal({
  open,
  onOpenChange,
}: AllUpcomingEventsModalProps) {
  const {
    data,
    isLoading,
    isError,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    refetch,
  } = useInfiniteUpcomingEvents({ days: 30, size: 10 });

  const openEventDetails = useCalendarStore((s) => s.openEventDetails);

  const events: CalendarEvent[] =
    data?.pages.flatMap((page) => page.content) ?? [];
  const totalCount = data?.pages[0]?.totalElements ?? events.length;

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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] flex flex-col gap-4">
        <DialogHeader className="space-y-1 pr-6">
          <div className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <CalendarIcon className="size-3.5" />
            </div>
            <DialogTitle className="font-heading text-base font-bold text-foreground">
              All Upcoming Events
            </DialogTitle>
            {totalCount > 0 && (
              <Badge
                variant="secondary"
                size="xs"
                className="font-mono font-bold ml-1"
              >
                {totalCount}
              </Badge>
            )}
          </div>
          <DialogDescription className="text-xs text-muted-foreground">
            Chronological overview of scheduled exams, assignments, and lectures
            across your communities.
          </DialogDescription>
        </DialogHeader>

        {/* Scrollable Body */}
        <div className="flex-1  space-y-4 pr-1 min-h-[220px]">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-2">
              <Spinner className="size-6 text-primary" />
              <p className="text-xs text-muted-foreground">
                Loading upcoming events...
              </p>
            </div>
          ) : isError ? (
            <div className="py-12 text-center space-y-2">
              <p className="text-xs text-destructive font-medium">
                Failed to load events.
              </p>
              <Button
                variant="outline"
                size="xs"
                onClick={() => refetch()}
                className="cursor-pointer text-xs"
              >
                Retry
              </Button>
            </div>
          ) : events.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center rounded-xl border border-dashed border-border/70 bg-muted/10 space-y-2">
              <div className="size-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                <Sparkles className="size-4" />
              </div>
              <p className="text-xs font-medium text-foreground">
                No upcoming events
              </p>
              <p className="text-[11px] text-muted-foreground max-w-xs leading-relaxed">
                You are all caught up for the next month.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <CalendarEventCardList
                groupedEvents={groupedEvents}
                onEventClick={openEventDetails}
              />

              {/* Load More Button */}
              {hasNextPage && (
                <div className="pt-2 pb-4 flex justify-center">
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
                      <span>Load more events</span>
                    )}
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
