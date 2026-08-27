import { Bell, Calendar as CalendarIcon, Clock, Plus } from "lucide-react";
import type { CalendarEvent } from "../api/types";
import { formatEventTime, getEventCategoryConfig } from "./CalendarEventPill";
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
  dateStr: string | null;
  events: CalendarEvent[];
  isOpen: boolean;
  onClose: () => void;
  onSelectEvent: (event: CalendarEvent) => void;
  onAddEventOnDate: (dateStr: string) => void;
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
  dateStr,
  events,
  isOpen,
  onClose,
  onSelectEvent,
  onAddEventOnDate,
}: DayOverflowModalProps) {
  if (!dateStr) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader className="gap-1">
          <div className="flex items-center gap-2">
            <CalendarIcon className="size-4 text-primary" />
            <DialogTitle className="text-base font-bold font-heading">
              {formatHeadingDate(dateStr)}
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs">
            Showing all {events.length} event{events.length === 1 ? "" : "s"}{" "}
            scheduled on this day.
          </DialogDescription>
        </DialogHeader>

        {/* Events List */}
        <div className="space-y-2 sm:max-h-[60vh] sm:overflow-y-auto sm:pr-1">
          {events.length === 0 ? (
            <p className="text-xs text-muted-foreground py-4 text-center">
              No events scheduled for this day.
            </p>
          ) : (
            events.map((ev) => {
              const config = getEventCategoryConfig(ev.type);
              const Icon = config.icon;
              const timeStr = formatEventTime(ev.startTime);
              const tag = ev.courseAbbreviation?.trim() || ev.courseSlug;

              return (
                <div
                  key={ev.id}
                  onClick={() => {
                    onClose();
                    onSelectEvent(ev);
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

                  {ev.courseName && (
                    <div className="mt-1 text-[11px] font-medium opacity-85 truncate">
                      {ev.courseName}
                    </div>
                  )}

                  {ev.description && (
                    <p className="mt-1 text-xs opacity-90 line-clamp-2">
                      {ev.description}
                    </p>
                  )}

                  <div className="mt-2 flex items-center justify-between text-[10px] opacity-80 pt-1.5 border-t border-current/20">
                    <span>{ev.communitySlug}</span>
                    <div className="flex items-center gap-2">
                      {ev.location && (
                        <span className="capitalize">
                          {ev.location.toLowerCase().replace("_", " ")}
                        </span>
                      )}
                      {ev.isSubscribed && (
                        <Badge
                          variant="secondary"
                          className="h-4 px-1 text-[9px] gap-1 bg-primary/20 text-primary border-none"
                        >
                          <Bell className="size-2.5" /> Set
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
              const currentD = dateStr;
              onClose();
              onAddEventOnDate(currentD);
            }}
            className="text-xs font-semibold text-primary hover:text-primary hover:bg-primary/10 gap-1.5 h-8 cursor-pointer"
          >
            <Plus className="size-3.5" /> Add event on this day
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            className="h-8 text-xs cursor-pointer"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
