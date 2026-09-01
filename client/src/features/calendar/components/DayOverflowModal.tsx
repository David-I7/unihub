import { useMemo } from "react";
import { Calendar as CalendarIcon, Plus } from "lucide-react";
import type { CalendarEvent } from "../api/types";
import { useCalendarStore } from "../store/useCalendarStore";
import { formatHeadingDate, getLocalDateKey } from "@/lib/dateUtils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CalendarEventCard } from "./CalendarEventCard";

interface DayOverflowModalProps {
  events: CalendarEvent[];
  canCreateEvent?: boolean;
}

export function DayOverflowModal({
  events,
  canCreateEvent = true,
}: DayOverflowModalProps) {
  const overflowDate = useCalendarStore((s) => s.overflowDate);
  const closeOverflowModal = useCalendarStore((s) => s.closeOverflowModal);
  const openEventDetails = useCalendarStore((s) => s.openEventDetails);
  const openCreateModal = useCalendarStore((s) => s.openCreateModal);

  const dayEvents = useMemo(() => {
    if (!overflowDate) return [];
    return events.filter((ev) => {
      const d = new Date(ev.startTime);
      if (isNaN(d.getTime())) return false;
      return getLocalDateKey(d) === overflowDate;
    });
  }, [events, overflowDate]);

  if (!overflowDate) return null;

  return (
    <Dialog
      open={Boolean(overflowDate)}
      onOpenChange={(open) => !open && closeOverflowModal()}
    >
      <DialogContent className="sm:max-w-lg">
        <DialogHeader className="gap-1">
          <div className="flex items-center gap-2">
            <CalendarIcon className="size-4 text-primary" />
            <DialogTitle className="text-base font-bold font-heading">
              {formatHeadingDate(overflowDate)}
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs">
            Showing all {dayEvents.length} event
            {dayEvents.length === 1 ? "" : "s"} scheduled on this day.
          </DialogDescription>
        </DialogHeader>

        {/* Events List */}
        <div className="space-y-2 sm:max-h-[60vh] sm:overflow-y-auto sm:pr-1">
          {dayEvents.length === 0 ? (
            <p className="text-xs text-muted-foreground py-4 text-center">
              No events scheduled for this day.
            </p>
          ) : (
            dayEvents.map((ev) => (
              <CalendarEventCard
                key={ev.id}
                event={ev}
                onClick={(event) => {
                  closeOverflowModal();
                  openEventDetails(event.id);
                }}
              />
            ))
          )}
        </div>

        {/* Add Event on this day Button & Close */}
        <div className="pt-2 border-t gap-2 flex justify-end items-center">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={closeOverflowModal}
            className="text-xs cursor-pointer"
          >
            Close
          </Button>
          {canCreateEvent ? (
            <Button
              size="sm"
              onClick={() => {
                const currentD = overflowDate;
                closeOverflowModal();
                openCreateModal(currentD);
              }}
              className="gap-1.5 font-semibold cursor-pointer shrink-0"
            >
              <Plus className="size-4" />
              <span>Add Event</span>
            </Button>
          ) : (
            <div />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
