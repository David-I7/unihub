import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router";
import { Calendar as CalendarIcon, ArrowRight, Check } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  useInfiniteUpcomingEvents,
  type CalendarEvent,
} from "@/features/calendar";
import { formatDayHeader, getLocalDateKey } from "@/lib/dateUtils";
import { AllUpcomingEventsModal } from "./AllUpcomingEventsModal";
import CalendarEventCardList from "@/features/calendar/components/CalendarEventCardList";

export function UpcomingEventsWidget() {
  const navigate = useNavigate();
  const [isAllModalOpen, setIsAllModalOpen] = useState(false);

  const { data, isLoading, isError, refetch } = useInfiniteUpcomingEvents({
    days: 7,
    size: 6,
  });

  const events: CalendarEvent[] =
    data?.pages.flatMap((page) => page.content) ?? [];
  const totalCount = data?.pages[0]?.totalElements ?? events.length;
  const displayedEvents = events.slice(0, 3);

  const groupedEvents = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();

    for (const ev of displayedEvents) {
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
  }, [displayedEvents]);

  return (
    <>
      <Card className="rounded-2xl border bg-card p-5 space-y-4 shadow-xs flex flex-col justify-between h-full min-h-[380px]">
        <div className="flex-1 space-y-4 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between gap-3 pb-2 border-b border-border/60">
            <div className="flex items-center gap-2">
              <div className="flex size-7 items-center justify-center rounded-lg bg-muted/60 text-muted-foreground">
                <CalendarIcon className="size-4" />
              </div>
              <div>
                <h2 className="font-heading text-sm sm:text-base font-bold text-foreground">
                  Upcoming Events
                </h2>
                <p className="text-[11px] text-muted-foreground">Next 7 days</p>
              </div>
            </div>

            <Link
              to="/calendar"
              className="text-xs font-semibold text-primary hover:underline flex items-center gap-1 shrink-0 group"
            >
              <span>Calendar</span>
              <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>

          {/* Body */}
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, dayIdx) => (
                <div key={dayIdx} className="space-y-2">
                  <div className="h-3.5 w-24 bg-muted rounded-md animate-pulse" />
                  <div className="p-3 rounded-xl border bg-card animate-pulse space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="h-3 w-16 bg-muted rounded-md" />
                      <div className="h-3 w-20 bg-muted rounded-md" />
                    </div>
                    <div className="h-4 w-3/4 bg-muted rounded-md" />
                  </div>
                </div>
              ))}
            </div>
          ) : isError ? (
            <div className="flex-1 flex flex-col items-center justify-center py-8 text-center space-y-2">
              <p className="text-xs text-destructive font-medium">
                Failed to load upcoming events.
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
          ) : displayedEvents.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-10 px-4 text-center rounded-xl border border-dashed border-border/70 bg-muted/10 space-y-2">
              <div className="size-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                <Check className="size-4" />
              </div>
              <p className="text-xs font-medium text-foreground">
                No events in the next 7 days
              </p>
              <p className="text-[11px] text-muted-foreground max-w-xs leading-relaxed">
                You are all caught up across all your enrolled communities.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <CalendarEventCardList
                groupedEvents={groupedEvents}
                onEventClick={(id) => navigate(`/calendar?eventId=${id}`)}
              />
            </div>
          )}
        </div>

        {/* Footer: View All Button */}
        {totalCount > 0 && (
          <div className="pt-2 border-t border-border/50">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAllModalOpen(true)}
              className="w-full text-xs font-semibold cursor-pointer h-8"
            >
              View all upcoming events ({totalCount})
            </Button>
          </div>
        )}
      </Card>

      {/* View All Modal */}
      {isAllModalOpen && (
        <AllUpcomingEventsModal
          open={isAllModalOpen}
          onOpenChange={setIsAllModalOpen}
        />
      )}
    </>
  );
}
