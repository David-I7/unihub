import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Trash2 } from "@/components/ui/icons";
import type { UserReminder } from "@/features/calendar/api/types";
import {
  formatDateTime24h,
  formatEventRelativeStatus,
  formatOffsetLabel,
} from "@/lib/dateUtils";
import { cn } from "@/lib/utils";

export default function ReminderList({
  reminders,
  onDelete,
  onOpen,
  isDeleting,
}: {
  reminders: UserReminder[];
  onDelete: (
    e: React.MouseEvent<HTMLButtonElement>,
    eventId: string,
    eventTitle: string,
  ) => void;
  onOpen: (eventId: string) => void;
  isDeleting: boolean;
}) {
  return reminders.map((reminder) => {
    const compactOffset = formatOffsetLabel(reminder.offsetMinutes, {
      compact: true,
    });
    const dateLine = formatDateTime24h(reminder.eventStartTime, {
      separator: " • ",
    });
    const relativeStatus = formatEventRelativeStatus(reminder.remindAt, null, {
      verb: "Fires",
    });

    return (
      <div
        key={reminder.id}
        onClick={() => onOpen(reminder.eventId)}
        className="group flex items-stretch gap-3 p-3 rounded-xl border bg-card hover:border-primary/60 hover:shadow-xs transition-all cursor-pointer"
      >
        {/* Left: offset badge */}
        <div className="flex flex-col items-center justify-center gap-0.5 min-w-[64px] px-2 py-2 rounded-xl shrink-0">
          <span className="font-mono text-xs font-bold text-amber-600 dark:text-amber-400">
            {compactOffset}
          </span>
          <span className="text-[10px] text-muted-foreground">before</span>
        </div>

        {/* Middle: event info */}
        <div className="flex-1 min-w-0 flex flex-col justify-center gap-0.5">
          <p className="text-[11px] text-muted-foreground truncate">
            {dateLine}
          </p>
          <h4 className="font-heading text-xs sm:text-sm font-bold text-foreground group-hover:text-primary transition-colors truncate">
            {reminder.eventTitle}
          </h4>
          {relativeStatus.label && (
            <Badge
              variant="secondary"
              className={cn(
                "gap-1 text-[11px] font-medium h-5 px-1.5",
                relativeStatus.isOngoing &&
                  "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 font-bold",
                relativeStatus.isSoon &&
                  !relativeStatus.isOngoing &&
                  "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30 font-semibold",
                relativeStatus.isPast && "bg-muted text-muted-foreground",
              )}
            >
              <Clock className="size-2.5" />
              <span>{relativeStatus.label}</span>
            </Badge>
          )}
        </div>

        {/* Right: delete */}
        <Button
          variant="ghost"
          size="icon-xs"
          title="Remove reminder"
          onClick={(e) => onDelete(e, reminder.eventId, reminder.eventTitle)}
          disabled={isDeleting}
          className="size-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0 cursor-pointer self-center"
        >
          <Trash2 className="size-3.5" />
        </Button>
      </div>
    );
  });
}
