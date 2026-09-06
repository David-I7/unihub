import { useState, useMemo } from "react";
import { Edit2, Trash2 } from "@/components/ui/icons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatDayHeader, getLocalDateKey } from "@/lib/dateUtils";
import { CalendarEventCard } from "./CalendarEventCard";
import CalendarEventCardList, {
  type CalendarEventGroup,
} from "./CalendarEventCardList";
import { BatchEditEventModal } from "./BatchEditEventModal";
import type { CalendarEvent } from "../api/types";
import type { BatchEventItemParsed } from "../schemas/eventSchemas";
import { toast } from "sonner";

interface BatchPreviewStepProps {
  parsedEvents: BatchEventItemParsed[];
  courseMap: Map<number, { name: string; abbreviation?: string }>;
  communityName: string;
  communitySlug: string;
  pastEventsCount: number;
  currentTime: number;
  onUpdateEvents: (updated: BatchEventItemParsed[]) => void;
}

export function BatchPreviewStep({
  parsedEvents,
  courseMap,
  communityName,
  communitySlug,
  pastEventsCount,
  currentTime,
  onUpdateEvents,
}: BatchPreviewStepProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const handleSaveEditedEvent = (updatedEvent: BatchEventItemParsed) => {
    if (editingIndex === null) return;
    const updatedList = [...parsedEvents];
    updatedList[editingIndex] = updatedEvent;
    onUpdateEvents(updatedList);
    setEditingIndex(null);
    toast.success("Event details updated");
  };

  const handleDeleteEvent = (indexToDelete: number) => {
    const updatedList = parsedEvents.filter((_, idx) => idx !== indexToDelete);
    onUpdateEvents(updatedList);
    toast.success("Event removed from batch");
  };

  // Group parsed events by date, preserving originalIndex for editing and deletion
  const groupedEvents: CalendarEventGroup<{
    event: BatchEventItemParsed;
    originalIndex: number;
  }>[] = useMemo(() => {
    const map = new Map<
      string,
      { event: BatchEventItemParsed; originalIndex: number }[]
    >();

    parsedEvents.forEach((ev, originalIndex) => {
      const d = new Date(ev.startTime);
      const key = isNaN(d.getTime()) ? "invalid" : getLocalDateKey(d);
      if (!map.has(key)) {
        map.set(key, []);
      }
      map.get(key)!.push({ event: ev, originalIndex });
    });

    const sortedKeys = Array.from(map.keys()).sort();

    return sortedKeys.map((key) => {
      const items = map.get(key)!;
      items.sort(
        (a, b) =>
          new Date(a.event.startTime).getTime() -
          new Date(b.event.startTime).getTime(),
      );
      if (key !== "invalid") {
        return {
          dateStr: key,
          events: items,
          ...formatDayHeader(key),
        };
      }
      return {
        dateStr: key,
        events: items,
        weekday: "Unscheduled",
        formattedDate: "Invalid Date",
        isToday: false,
      };
    });
  }, [parsedEvents]);

  const activeEditingEvent =
    editingIndex !== null ? (parsedEvents[editingIndex] ?? null) : null;
  const activeEditingCourse = activeEditingEvent
    ? courseMap.get(activeEditingEvent.courseId)
    : undefined;

  return (
    <div className="space-y-4">
      {/* Summary stats bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl bg-muted/40 border text-xs">
        <div className="flex items-center gap-3">
          <span>
            Total:{" "}
            <strong className="text-foreground">{parsedEvents.length}</strong>{" "}
            events
          </span>
          <span>
            Lectures:{" "}
            <strong>
              {parsedEvents.filter((e) => e.type === "LECTURE").length}
            </strong>
          </span>
          <span>
            Exams:{" "}
            <strong>
              {parsedEvents.filter((e) => e.type === "EXAM").length}
            </strong>
          </span>
        </div>

        {pastEventsCount > 0 && (
          <Badge variant="destructive" size="sm" className="gap-1">
            {pastEventsCount} event(s) in the past (must be future)
          </Badge>
        )}
      </div>

      {pastEventsCount > 0 && (
        <div className="flex items-start gap-2 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs">
          <div className="flex-1">
            Some events have start dates in the past. The server strictly
            rejects past dates. Please edit the event or verify the year in the
            schedule.
          </div>
        </div>
      )}

      {/* Event cards grouped by date */}
      {parsedEvents.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 rounded-2xl border border-dashed text-center">
          <p className="text-xs text-muted-foreground">
            No events left in this batch. Return to the JSON step to paste or
            add events.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <CalendarEventCardList
            groupedEvents={groupedEvents}
            renderCard={({ event, originalIndex }, formattedDate) => {
              const courseInfo = courseMap.get(event.courseId);
              const isPast = new Date(event.startTime).getTime() < currentTime;

              const calEv: CalendarEvent = {
                id: `batch-event-${originalIndex}`,
                title: event.title,
                type: event.type,
                startTime: event.startTime,
                durationHours: event.durationHours ?? undefined,
                location: event.location,
                courseAbbreviation: courseInfo?.abbreviation,
                communityName:
                  courseInfo?.name || communityName || communitySlug,
                isSubscribed: false,
              };

              const actions = (
                <>
                  {isPast && (
                    <Badge
                      variant="destructive"
                      size="xs"
                      className="h-5 px-1.5 text-[10px]"
                    >
                      Past
                    </Badge>
                  )}
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-6 text-muted-foreground hover:text-foreground cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingIndex(originalIndex);
                    }}
                    title="Edit event details"
                  >
                    <Edit2 className="size-3" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-6 text-muted-foreground hover:text-destructive cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteEvent(originalIndex);
                    }}
                    title="Remove event"
                  >
                    <Trash2 className="size-3" />
                  </Button>
                </>
              );

              return (
                <CalendarEventCard
                  key={originalIndex}
                  event={calEv}
                  formattedDate={formattedDate}
                  actions={actions}
                  locationDetails={event.locationDetails}
                  description={event.description}
                  onClick={() => setEditingIndex(originalIndex)}
                  className={cn(
                    isPast &&
                      "border-destructive/30 bg-destructive/5 hover:border-destructive/60",
                  )}
                />
              );
            }}
          />
        </div>
      )}

      {/* Manual Event Details Editor */}
      <BatchEditEventModal
        open={editingIndex !== null}
        onOpenChange={(open) => !open && setEditingIndex(null)}
        event={activeEditingEvent}
        communityName={communityName}
        courseName={
          activeEditingCourse?.name ||
          (activeEditingEvent ? `Course #${activeEditingEvent.courseId}` : "")
        }
        onSave={handleSaveEditedEvent}
      />
    </div>
  );
}
