import { Bell } from "lucide-react";
import type { CalendarEvent } from "../api/types";
import {
  EventLocationIcon,
  formatEventLocation,
  getEventCategoryConfig,
} from "../utils/eventUtils";
import {
  formatDayHeader,
  formatTime,
  getLocalDateKey,
  getTime,
} from "@/lib/dateUtils";
import { cn } from "@/lib/utils";

export interface CalendarEventCardProps {
  event: CalendarEvent;
  onClick?: (event: CalendarEvent) => void;
  className?: string;
  formattedDate: string;
  actions?: React.ReactNode;
  locationDetails?: string | null;
  description?: string | null;
}

function getStartAndEndTimeStr(
  event: { startTime: string; durationHours?: number | null; type?: string },
  formattedDate: string,
): { startTimeStr: string; endTimeStr?: string } {
  const startDate = new Date(event.startTime);
  if (isNaN(startDate.getTime())) {
    return { startTimeStr: event.startTime };
  }
  const shouldShowEndTime =
    event.type !== "ASSIGNMENT" &&
    event.durationHours &&
    event.durationHours > 0;

  if (!shouldShowEndTime) {
    const startTimeStr = formatTime(event.startTime);
    return { startTimeStr };
  }

  const endDate = new Date(
    startDate.getTime() + event.durationHours! * 60 * 60 * 1000,
  );

  if (getTime(endDate, "days") - getTime(startDate, "days") >= 1) {
    return {
      startTimeStr: `${formattedDate}, ${formatTime(event.startTime)}`,
      endTimeStr: `${formatDayHeader(getLocalDateKey(endDate)).formattedDate}, ${formatTime(endDate.toISOString())}`,
    };
  }

  return {
    startTimeStr: formatTime(event.startTime),
    endTimeStr: formatTime(endDate.toISOString()),
  };
}

export function CalendarEventCard({
  event,
  onClick,
  className,
  formattedDate,
  actions,
  locationDetails,
  description,
}: CalendarEventCardProps) {
  const config = getEventCategoryConfig(event.type);
  const Icon = config.icon;
  const { startTimeStr, endTimeStr } = getStartAndEndTimeStr(
    event,
    formattedDate,
  );

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
        <div className="font-mono text-sm sm:text-base font-medium text-foreground tracking-tight px-1">
          {startTimeStr}
        </div>

        {endTimeStr && (
          <>
            <div className="text-[10px] text-muted-foreground font-medium">
              |
            </div>
            <span className="font-mono text-sm sm:text-base font-medium text-foreground tracking-tight">
              {endTimeStr}
            </span>
          </>
        )}
      </div>

      {/* Right Column: Event Content */}
      <div className="flex-1 min-w-0 flex flex-col justify-between gap-1.5">
        {/* Top Row: Type Badge + Location on left; Bell / Actions on right */}
        <div className="flex items-center justify-between gap-2">
          {event.communityName && (
            <span className="text-[11px] text-muted-foreground font-medium text-ellipsis line-clamp-1">
              {event.communityName}
            </span>
          )}
          <div className="flex items-center gap-1 shrink-0">
            {event.isSubscribed && (
              <span
                title="Reminder active"
                className="flex items-center text-amber-500 shrink-0"
              >
                <Bell className="size-3.5 fill-amber-500/20 text-amber-500" />
              </span>
            )}
            {actions}
          </div>
        </div>
        <div className="flex items-center justify-between text-xs">
          {/* Title */}
          <h4 className="font-heading text-sm sm:text-base font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">
            {event.title}
          </h4>
        </div>

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

          {event.courseAbbreviation && (
            <span className="font-mono text-sm font-medium text-foreground bg-muted px-1.5 py-0.2 rounded">
              {event.courseAbbreviation}
            </span>
          )}

          {event.location && (
            <span className="inline-flex items-center gap-1 text-muted-foreground text-[11px] font-medium truncate">
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-muted text-xs font-medium text-foreground">
                <EventLocationIcon
                  location={event.location}
                  className="size-3.5 text-muted-foreground"
                />
                <span>{formatEventLocation(event.location)}</span>
              </span>
            </span>
          )}

          {locationDetails && (
            <span className="text-[11px] text-muted-foreground truncate">
              ({locationDetails})
            </span>
          )}
        </div>

        {description && (
          <p className="text-[11px] text-muted-foreground/90 italic line-clamp-2 mt-0.5">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}
