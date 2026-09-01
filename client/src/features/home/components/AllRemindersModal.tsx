import { toast } from "sonner";
import { Bell, Trash2, CheckCircle2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";
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

interface AllRemindersModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AllRemindersModal({
  open,
  onOpenChange,
}: AllRemindersModalProps) {
  const {
    data,
    isLoading,
    isError,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    refetch,
  } = useInfiniteUserReminders({ status: "PENDING", size: 10 });

  const deleteReminderMutation = useDeleteReminder();
  const openEventDetails = useCalendarStore((s) => s.openEventDetails);

  const reminders = data?.pages.flatMap((page) => page.content) ?? [];
  const totalCount = data?.pages[0]?.totalElements ?? reminders.length;

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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] flex flex-col p-5 sm:p-6 gap-4">
        <DialogHeader className="space-y-1 pr-6">
          <div className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500">
              <Bell className="size-3.5" />
            </div>
            <DialogTitle className="font-heading text-base font-bold text-foreground">
              All Active Reminders
            </DialogTitle>
            {totalCount > 0 && (
              <Badge
                variant="secondary"
                size="xs"
                className="font-mono font-bold ml-1"
              >
                {totalCount}
              </Badge>
            )}
          </div>
          <DialogDescription className="text-xs text-muted-foreground">
            Manage your scheduled notifications for upcoming exams, assignments,
            and lectures.
          </DialogDescription>
        </DialogHeader>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 min-h-[220px]">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-2">
              <Spinner className="size-6 text-primary" />
              <p className="text-xs text-muted-foreground">
                Loading reminders...
              </p>
            </div>
          ) : isError ? (
            <div className="py-12 text-center space-y-2">
              <p className="text-xs text-destructive font-medium">
                Failed to load reminders.
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
          ) : reminders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center rounded-xl border border-dashed border-border/70 bg-muted/10 space-y-2">
              <div className="size-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                <CheckCircle2 className="size-4" />
              </div>
              <p className="text-xs font-medium text-foreground">
                No active reminders
              </p>
              <p className="text-[11px] text-muted-foreground max-w-xs leading-relaxed">
                You have no scheduled reminders right now.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {reminders.map((reminder) => {
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
                    className="group flex items-center justify-between gap-3 p-3 rounded-xl border bg-card hover:border-primary/60 hover:shadow-xs transition-all cursor-pointer"
                  >
                    {/* Left: Alert Time Anchor */}
                    <div className="flex flex-col items-start min-w-[76px] shrink-0">
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
                        {reminder.communityName && (
                          <span> • {reminder.communityName}</span>
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
                      <span>Load more</span>
                    )}
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
