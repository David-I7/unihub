import { useMemo } from "react";
import { Bell, Calendar as CalendarIcon, Clock, Plus } from "lucide-react";
import type { CalendarEvent } from "../api/types";
import { useCalendarStore } from "../store/useCalendarStore";
import {
  formatEventTime,
  getEventCategoryConfig,
  isEventCompleted,
} from "./CalendarEventPill";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface DayOverflowModalProps {
  events: CalendarEvent[];
  canCreateEvent?: boolean;
}

function getLocalDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function formatHeadingDate(dateStr?: string | null): string {
  if (!dateStr) return "";
  const d = new Date(dateStr + "T00:00:00");
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
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
    <Dialog open={Boolean(overflowDate)} onOpenChange={(open) => !open && closeOverflowModal()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader className="gap-1">
          <div className="flex items-center gap-2">
            <CalendarIcon className="size-4 text-primary" />
            <DialogTitle className="text-base font-bold font-heading">
              {formatHeadingDate(overflowDate)}
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs">
            Showing all {dayEvents.length} event{dayEvents.length === 1 ? "" : "s"}{" "}
            scheduled on this day.
          </DialogDescription>
        </DialogHeader>

        {/* Events List */}
        <div className="space-y-2 sm:max-h-[60vh] sm:overflow-y-auto sm:pr-1">
          {dayEvents.length === 0 ? (
            <p className="text-xs text-muted-foreground py-4 text-center">
              No events scheduled for this day.
            </p>
          ) : (
            dayEvents.map((ev) => {
              const config = getEventCategoryConfig(ev.type);
              const Icon = config.icon;
              const timeStr = formatEventTime(ev.startTime);
              const tag = ev.courseAbbreviation?.trim() || ev.courseSlug;

              return (
                <div
                  key={ev.id}
                  onClick={() => {
                    closeOverflowModal();
                    openEventDetails(ev);
                  }}
                  className={`rounded-xl border p-3 transition-all cursor-pointer select-none ${config.container}`}
                >
                  <div className="flex items-center justify-between gap-2 text-xs font-bold">
                    <span className="flex items-center gap-1.5 min-w-0">
                      <Icon className="size-3.5 shrink-0" />
                      {tag && (
                        <span className="font-mono text-[10px] uppercase font-bold shrink-0 opacity-80">
                          [{tag}]
                        </span>
                      )}
                      <span className="truncate">{ev.title}</span>
                    </span>

                    {timeStr && (
                      <span className="font-mono text-[10px] shrink-0 flex items-center gap-1 opacity-80">
                        <Clock className="size-3" />
                        {timeStr}
                      </span>
                    )}
                  </div>

                  <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[11px]">
                    {ev.studyYear && (
                      <span className="text-[10px] font-medium opacity-80 bg-background/50 px-1.5 py-0.5 rounded">
                        {ev.studyYear}
                      </span>
                    )}
                    {ev.courseName && (
                      <span className="font-medium opacity-85 truncate">
                        {ev.courseName}
                      </span>
                    )}
                  </div>

                  <div className="mt-2 flex items-center justify-between text-[10px] opacity-80 pt-1.5 border-t border-current/20">
                    <span>{ev.communityName || ev.communitySlug}</span>
                    <div className="flex items-center gap-2">
                      {ev.location && (
                        <span className="capitalize">
                          {ev.location.toLowerCase().replace("_", " ")}
                        </span>
                      )}
                      {ev.isSubscribed && !isEventCompleted(ev) && (
                        <Badge
                          variant="secondary"
                          className="h-4 px-1.5 text-[9px] gap-1 bg-primary/20 text-primary border-none font-semibold"
                        >
                          <Bell className="size-2.5 fill-current" /> Reminder
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Add Event on this day Button */}
        <div className="pt-2 border-t flex justify-between items-center">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              const currentD = overflowDate;
              closeOverflowModal();
              openCreateModal(currentD);
            }}
            disabled={!canCreateEvent}
            className="text-xs font-semibold text-primary hover:text-primary hover:bg-primary/10 gap-1.5 h-8 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="size-3.5" /> Add event on this day
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={closeOverflowModal}
            className="h-8 text-xs cursor-pointer"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
