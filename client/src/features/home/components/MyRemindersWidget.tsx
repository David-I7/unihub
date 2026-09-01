import { toast } from "sonner";
import {
  Bell,
  Clock,
  Trash2,
  CheckCircle2,
  ExternalLink,
  GraduationCap,
  BookOpen,
  Users,
} from "@/components/ui/icons";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  useInfiniteUserReminders,
  useDeleteReminder,
  useCalendarStore,
  type UserReminder,
} from "@/features/calendar";
import { getEventCategoryConfig } from "@/features/calendar/utils/eventUtils";
import {
  formatDateTime24h,
  formatEventTimeWithDuration,
  formatOffsetLabel,
  formatEventRelativeStatus,
} from "@/lib/dateUtils";
import { getErrorMessage } from "@/api/types";
import { cn } from "@/lib/utils";

export function MyRemindersWidget() {
  const {
    data,
    isLoading,
    isError,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    refetch,
  } = useInfiniteUserReminders({ status: "PENDING", size: 5 });

  const deleteReminderMutation = useDeleteReminder();
  const openEventDetails = useCalendarStore((s) => s.openEventDetails);

  const reminders: UserReminder[] =
    data?.pages.flatMap((page) => page.content) ?? [];

  const handleDelete = async (
    e: React.MouseEvent,
    eventId: string,
    eventTitle: string,
  ) => {
    e.stopPropagation();
    try {
      await deleteReminderMutation.mutateAsync(eventId);
      toast.success(`Reminder removed for "${eventTitle}"`);
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Failed to remove reminder."));
    }
  };

  return (
    <Card className="rounded-2xl border bg-card p-5 space-y-4 shadow-xs">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 pb-1 border-b border-border/60">
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500">
            <Bell className="size-4" />
          </div>
          <div>
            <h2 className="font-heading text-base font-bold text-foreground">
              My Reminders
            </h2>
            <p className="text-[11px] text-muted-foreground">Active alerts</p>
          </div>
        </div>

        {reminders.length > 0 && (
          <Badge variant="secondary" size="xs" className="font-mono font-bold">
            {reminders.length}
          </Badge>
        )}
      </div>

      {/* Body */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl border bg-card animate-pulse space-y-3"
            >
              <div className="h-4 w-1/3 bg-muted rounded-md" />
              <div className="h-4 w-3/4 bg-muted rounded-md" />
              <div className="h-3 w-1/2 bg-muted rounded-md" />
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="py-6 text-center space-y-2">
          <p className="text-xs text-destructive font-medium">
            Failed to load active reminders.
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
      ) : reminders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 px-4 text-center rounded-xl border border-dashed border-border/70 bg-muted/10 space-y-2">
          <div className="size-9 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
            <CheckCircle2 className="size-4 text-muted-foreground" />
          </div>
          <p className="text-xs font-medium text-foreground">
            No active reminders
          </p>
          <p className="text-[11px] text-muted-foreground max-w-xs leading-relaxed">
            Click the bell icon on any event in your calendar to schedule timely
            notifications.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {reminders.map((reminder) => {
            const config = getEventCategoryConfig(reminder.eventType);
            const CategoryIcon = config.icon;
            const remindAtFormatted = formatDateTime24h(reminder.remindAt);
            const eventTimeFormatted = formatDateTime24h(
              reminder.eventStartTime,
            );
            const timeDurationFormatted = formatEventTimeWithDuration(
              reminder.eventStartTime,
              reminder.durationHours,
            );
            const offsetText = formatOffsetLabel(reminder.offsetMinutes);
            const relative = formatEventRelativeStatus(
              reminder.eventStartTime,
              reminder.durationHours,
            );

            return (
              <div
                key={reminder.id}
                onClick={() => openEventDetails(reminder.eventId)}
                className="group relative overflow-hidden rounded-2xl border bg-card p-4 sm:p-4.5 shadow-xs transition-all duration-200 hover:border-primary/60 hover:shadow-md cursor-pointer space-y-3"
              >
                {/* Top Trigger Banner: Reminder Trigger Time & Offset + Delete Button */}
                <div className="flex items-center justify-between gap-2 text-xs pb-2 border-b border-border/50">
                  <div className="flex items-center gap-1.5 min-w-0 text-amber-600 dark:text-amber-400 font-medium">
                    <Bell className="size-3.5 shrink-0 fill-amber-500/20 text-amber-500" />
                    <span className="font-semibold truncate">
                      Alert: {remindAtFormatted}
                    </span>
                    <span className="text-[11px] text-muted-foreground shrink-0">
                      ({offsetText})
                    </span>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon-xs"
                    title="Cancel reminder"
                    onClick={(e) =>
                      handleDelete(e, reminder.eventId, reminder.eventTitle)
                    }
                    disabled={deleteReminderMutation.isPending}
                    className="size-6 text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0 cursor-pointer"
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>

                {/* Middle: Event Category Badge + Title + Start Time */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 font-bold text-[11px] tracking-wide px-2 py-0.5 rounded-md",
                          config.badge,
                        )}
                      >
                        <CategoryIcon className="size-3 shrink-0" />
                        <span>{config.label}</span>
                      </span>

                      <h3 className="font-heading text-sm sm:text-base font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                        {reminder.eventTitle}
                      </h3>
                    </div>

                    <span className="text-[11px] font-semibold text-muted-foreground shrink-0">
                      {relative.label}
                    </span>
                  </div>

                  {/* Start Time info */}
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock className="size-3.5 text-muted-foreground/70 shrink-0" />
                    <span className="font-medium text-foreground">
                      Starts: {eventTimeFormatted}
                    </span>
                    {timeDurationFormatted && (
                      <span className="text-muted-foreground/80">
                        ({timeDurationFormatted})
                      </span>
                    )}
                  </div>
                </div>

                {/* Footer Metadata: Community, Course, Year + View Event link */}
                <div className="flex items-center justify-between gap-2 pt-2 border-t border-border/40 text-xs text-muted-foreground">
                  <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 min-w-0">
                    {reminder.communityName && (
                      <span className="inline-flex items-center gap-1 font-semibold text-foreground/90 truncate">
                        <Users className="size-3 text-muted-foreground shrink-0" />
                        <span>{reminder.communityName}</span>
                      </span>
                    )}

                    {reminder.courseAbbreviation && (
                      <span className="inline-flex items-center gap-1 truncate">
                        <span className="text-muted-foreground/40">•</span>
                        <BookOpen className="size-3 text-muted-foreground shrink-0" />
                        <span className="font-mono text-[11px] font-bold text-foreground bg-muted px-1.5 py-0.2 rounded">
                          {reminder.courseAbbreviation}
                        </span>
                        {reminder.courseName && (
                          <span className="truncate max-w-[140px]">
                            {reminder.courseName}
                          </span>
                        )}
                      </span>
                    )}

                    {reminder.studyYear && (
                      <span className="inline-flex items-center gap-1 shrink-0">
                        <span className="text-muted-foreground/40">•</span>
                        <GraduationCap className="size-3 text-muted-foreground shrink-0" />
                        <span>{reminder.studyYear}</span>
                      </span>
                    )}
                  </div>

                  {/* Direct Link to View Event */}
                  <div className="flex items-center gap-1 text-[11px] font-semibold text-primary group-hover:underline shrink-0">
                    <span>View</span>
                    <ExternalLink className="size-3" />
                  </div>
                </div>
              </div>
            );
          })}

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
                  <span>See more reminders</span>
                )}
              </Button>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
