import { toast } from "sonner";
import { Bell, Clock, Trash2, CheckCircle2 } from "@/components/ui/icons";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  useInfiniteUserReminders,
  useDeleteReminder,
  type UserReminder,
} from "@/features/calendar";
import { formatDateTime24h, formatOffsetLabel } from "@/lib/dateUtils";
import { getErrorMessage } from "@/api/types";

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

  const reminders: UserReminder[] =
    data?.pages.flatMap((page) => page.content) ?? [];

  const handleDelete = async (eventId: string, eventTitle: string) => {
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
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
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
        <div className="space-y-2.5">
          {Array.from({ length: 3 }).map((_, idx) => (
            <div
              key={idx}
              className="p-3 rounded-xl border border-border/50 bg-muted/20 animate-pulse space-y-2"
            >
              <div className="h-4 w-1/2 bg-muted rounded-md" />
              <div className="h-3 w-3/4 bg-muted rounded-md" />
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
        <div className="space-y-2.5">
          {reminders.map((reminder) => {
            const remindAtFormatted = formatDateTime24h(reminder.remindAt);
            const eventTimeFormatted = formatDateTime24h(
              reminder.eventStartTime,
            );
            const offsetText = formatOffsetLabel(reminder.offsetMinutes);

            return (
              <div
                key={reminder.id}
                className="group relative flex items-start justify-between gap-3 p-3.5 rounded-xl border border-border/70 bg-card hover:border-primary/50 hover:shadow-xs transition-all duration-200"
              >
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs font-bold text-foreground line-clamp-1">
                      {reminder.eventTitle}
                    </span>
                    {reminder.courseAbbreviation && (
                      <Badge
                        variant="outline"
                        size="xs"
                        className="font-mono text-[10px] uppercase text-muted-foreground"
                      >
                        {reminder.courseAbbreviation}
                      </Badge>
                    )}
                  </div>

                  {reminder.communityName && (
                    <p className="text-[11px] text-muted-foreground line-clamp-1">
                      {reminder.communityName}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-x-2 text-[11px] text-muted-foreground pt-0.5">
                    <span className="flex items-center gap-1 font-medium text-amber-500">
                      <Clock className="size-3" />
                      <span>{remindAtFormatted}</span>
                    </span>
                    <span className="text-muted-foreground/70">
                      ({offsetText})
                    </span>
                  </div>

                  <p className="text-[10px] text-muted-foreground/80">
                    Event starts: {eventTimeFormatted}
                  </p>
                </div>

                {/* Cancel Reminder Action */}
                <Button
                  variant="ghost"
                  size="icon-xs"
                  title="Remove reminder"
                  onClick={() =>
                    handleDelete(reminder.eventId, reminder.eventTitle)
                  }
                  disabled={deleteReminderMutation.isPending}
                  className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0 cursor-pointer"
                >
                  <Trash2 className="size-3.5" />
                </Button>
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
