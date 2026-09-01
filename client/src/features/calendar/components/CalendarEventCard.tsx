import { Bell } from "lucide-react";
import type { CalendarEvent } from "../api/types";
import {
  formatEventLocation,
  getEventCategoryConfig,
  getEventLocationIcon,
} from "../utils/eventUtils";
import { formatDurationHours, formatTime } from "@/lib/dateUtils";
import { cn } from "@/lib/utils";

interface CalendarEventCardProps {
  event: CalendarEvent;
  onClick?: (event: CalendarEvent) => void;
  className?: string;
}

export function CalendarEventCard({
  event,
  onClick,
  className,
}: CalendarEventCardProps) {
  const config = getEventCategoryConfig(event.type);
  const Icon = config.icon;
  const startTimeStr = formatTime(event.startTime);
  const durationStr = formatDurationHours(event.durationHours);
  const LocationIcon = getEventLocationIcon(event.location);
  const abbreviation = event.courseAbbreviation?.trim();

  // Compute end time string if duration exists
  const endTimeStr = (() => {
    if (!event.durationHours || event.durationHours <= 0) return null;
    const startD = new Date(event.startTime);
    if (isNaN(startD.getTime())) return null;
    const endD = new Date(startD.getTime() + event.durationHours * 3600 * 1000);
    return formatTime(endD.toISOString());
  })();

  return (
    <div
      onClick={() => onClick?.(event)}
      className={cn(
        "group flex items-stretch gap-3 sm:gap-4 rounded-2xl border bg-card p-3 sm:p-4 shadow-xs transition-all duration-200 hover:border-primary/60 hover:shadow-md cursor-pointer",
        className,
      )}
    >
      {/* Left Column: Timeline Time Anchor */}
      <div className="flex flex-col items-center justify-center min-w-[58px] sm:min-w-[68px] px-1 py-1.5 rounded-xl bg-muted/40 border border-border/40 text-center shrink-0 self-start">
        <span className="font-mono text-sm sm:text-base font-bold text-foreground tracking-tight">
          {startTimeStr}
        </span>
        {durationStr && (
          <span className="text-[10px] text-muted-foreground font-medium mt-0.5">
            {durationStr}
          </span>
        )}
      </div>

      {/* Right Column: Event Content */}
      <div className="flex-1 min-w-0 flex flex-col justify-between gap-1.5">
        {/* Top Row: Type Badge + Location on left; Bell on right */}
        <div className="flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1.5 flex-wrap min-w-0">
            <span
              className={cn(
                "inline-flex items-center gap-1 font-bold text-[11px] tracking-wide px-2 py-0.5 rounded-md",
                config.badge,
              )}
            >
              <Icon className="size-3 shrink-0" />
              <span>{config.label}</span>
            </span>

            {abbreviation && (
              <span className="font-mono text-[10px] font-bold text-foreground bg-muted px-1.5 py-0.2 rounded">
                {abbreviation}
              </span>
            )}

            {event.location && (
              <span className="inline-flex items-center gap-1 text-muted-foreground text-[11px] font-medium truncate">
                <span className="text-muted-foreground/40">•</span>
                <LocationIcon className="size-3 text-muted-foreground shrink-0" />
                <span className="truncate">
                  {formatEventLocation(event.location)}
                </span>
              </span>
            )}
          </div>

          {/* Active Reminder Bell */}
          {event.isSubscribed && (
            <span
              title="Reminder active"
              className="flex items-center text-amber-500 shrink-0"
            >
              <Bell className="size-3.5 fill-amber-500/20 text-amber-500" />
            </span>
          )}
        </div>

        {/* Title */}
        <h4 className="font-heading text-sm sm:text-base font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">
          {event.title}
        </h4>

        {/* Bottom Metadata: End Time & Course Abbreviation */}
        {(endTimeStr || abbreviation) && (
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground pt-0.5">
            {endTimeStr && (
              <span className="text-muted-foreground text-[11px] flex items-center gap-1">
                <span>Ends {endTimeStr}</span>
                {abbreviation && (
                  <span className="text-muted-foreground/40">•</span>
                )}
              </span>
            )}

            {abbreviation && (
              <span className="font-mono text-[10px] font-bold text-foreground bg-muted px-1.5 py-0.2 rounded">
                [{abbreviation}]
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
