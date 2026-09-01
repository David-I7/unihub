import { useState } from "react";
import { toast } from "sonner";
import { Bell, Trash2, CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  useInfiniteUserReminders,
  useDeleteReminder,
  useCalendarStore,
} from "@/features/calendar";
import {
  formatDateTime24h,
  formatOffsetLabel,
  formatEventRelativeStatus,
} from "@/lib/dateUtils";
import { getErrorMessage } from "@/api/types";
import { AllRemindersModal } from "./AllRemindersModal";

export function MyRemindersWidget() {
  const [isAllModalOpen, setIsAllModalOpen] = useState(false);

  const { data, isLoading, isError, refetch } = useInfiniteUserReminders({
    status: "PENDING",
    size: 5,
  });

  const deleteReminderMutation = useDeleteReminder();
  const openEventDetails = useCalendarStore((s) => s.openEventDetails);

  const reminders = data?.pages.flatMap((page) => page.content) ?? [];
  const totalCount = data?.pages[0]?.totalElements ?? reminders.length;
  const displayedReminders = reminders.slice(0, 4);

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
    <>
      <Card className="rounded-2xl border bg-card p-5 space-y-4 shadow-xs flex flex-col justify-between h-full min-h-[380px]">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between gap-3 pb-2 border-b border-border/60">
            <div className="flex items-center gap-2">
              <div className="flex size-7 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500">
                <Bell className="size-4" />
              </div>
              <div>
                <h2 className="font-heading text-sm sm:text-base font-bold text-foreground">
                  My Reminders
                </h2>
                <p className="text-[11px] text-muted-foreground">Active alerts</p>
              </div>
            </div>

            {totalCount > 0 && (
              <Badge variant="secondary" size="xs" className="font-mono font-bold">
                {totalCount}
              </Badge>
            )}
          </div>

          {/* Body */}
          {isLoading ? (
            <div className="space-y-2.5">
              {Array.from({ length: 3 }).map((_, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl border bg-card animate-pulse space-y-2"
                >
                  <div className="flex justify-between items-center">
                    <div className="h-3.5 w-16 bg-muted rounded-md" />
                    <div className="h-3.5 w-24 bg-muted rounded-md" />
                  </div>
                  <div className="h-4 w-3/4 bg-muted rounded-md" />
                </div>
              ))}
            </div>
          ) : isError ? (
            <div className="py-8 text-center space-y-2">
              <p className="text-xs text-destructive font-medium">
                Failed to load active reminders.
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
          ) : displayedReminders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 px-4 text-center rounded-xl border border-dashed border-border/70 bg-muted/10 space-y-2">
              <div className="size-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                <CheckCircle2 className="size-4" />
              </div>
              <p className="text-xs font-medium text-foreground">
                No active reminders
              </p>
              <p className="text-[11px] text-muted-foreground max-w-xs leading-relaxed">
                Click the reminder button on any event to schedule notifications.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {displayedReminders.map((reminder) => {
                const remindAtFormatted = formatDateTime24h(reminder.remindAt);
                const offsetText = formatOffsetLabel(reminder.offsetMinutes);
                const relative = formatEventRelativeStatus(
                  reminder.eventStartTime,
                  reminder.durationHours,
                );

                return (
                  <div
                    key={reminder.id}
                    onClick={() => openEventDetails(reminder.eventId)}
                    className="group flex items-center justify-between gap-3 p-2.5 sm:p-3 rounded-xl border bg-card hover:border-primary/60 hover:shadow-xs transition-all cursor-pointer"
                  >
                    {/* Left: Alert Time Anchor */}
                    <div className="flex flex-col items-start min-w-[70px] shrink-0">
                      <span className="font-mono text-xs font-bold text-amber-600 dark:text-amber-400">
                        {remindAtFormatted.split(",")[1]?.trim() ||
                          remindAtFormatted}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {remindAtFormatted.split(",")[0]}
                      </span>
                    </div>

                    {/* Middle: Event Title & Notification Subtitle */}
                    <div className="flex-1 min-w-0 space-y-0.5">
                      <h4 className="font-heading text-xs sm:text-sm font-bold text-foreground group-hover:text-primary transition-colors truncate">
                        {reminder.eventTitle}
                      </h4>
                      <p className="text-[11px] text-muted-foreground truncate">
                        <span>{offsetText}</span>
                        {relative.label && (
                          <span> • {relative.label}</span>
                        )}
                      </p>
                    </div>

                    {/* Right: Delete Action */}
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      title="Remove reminder"
                      onClick={(e) =>
                        handleDelete(e, reminder.eventId, reminder.eventTitle)
                      }
                      disabled={deleteReminderMutation.isPending}
                      className="size-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0 cursor-pointer"
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                );
              })}
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
              View all reminders ({totalCount})
            </Button>
          </div>
        )}
      </Card>

      {/* View All Modal */}
      {isAllModalOpen && (
        <AllRemindersModal
          open={isAllModalOpen}
          onOpenChange={setIsAllModalOpen}
        />
      )}
    </>
  );
}
