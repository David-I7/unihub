import { useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { Bell, Check } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  useInfiniteUserReminders,
  useDeleteReminder,
} from "@/features/calendar";
import { getErrorMessage } from "@/api/types";
import { AllRemindersModal } from "./AllRemindersModal";
import ReminderList from "./ReminderList";

export function MyRemindersWidget() {
  const navigate = useNavigate();
  const [isAllModalOpen, setIsAllModalOpen] = useState(false);

  const { data, isLoading, isError, refetch } = useInfiniteUserReminders({
    status: "PENDING",
    size: 5,
  });

  const deleteReminderMutation = useDeleteReminder();

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
        <div className="space-y-4 flex flex-col flex-1">
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
                <p className="text-[11px] text-muted-foreground">
                  Active alerts
                </p>
              </div>
            </div>

            {totalCount > 0 && (
              <Badge
                variant="secondary"
                size="xs"
                className="font-mono font-bold"
              >
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
                  className="flex items-stretch gap-3 p-3 rounded-xl border bg-card animate-pulse"
                >
                  <div className="min-w-[64px] h-16 bg-muted rounded-xl shrink-0" />
                  <div className="flex-1 space-y-2 py-1">
                    <div className="h-3.5 w-2/4 bg-muted rounded-md" />
                    <div className="h-3 w-3/4 bg-muted rounded-md" />
                    <div className="h-3 w-1/4 bg-muted rounded-md" />
                  </div>
                </div>
              ))}
            </div>
          ) : isError ? (
            <div className="flex-1 flex flex-col justify-center items-center py-8 text-center space-y-2">
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
            <div className="flex-1 flex flex-col items-center justify-center py-10 px-4 text-center rounded-xl border border-dashed border-border/70 bg-muted/10 space-y-2">
              <div className="size-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                <Check className="size-4" />
              </div>
              <p className="text-xs font-medium text-foreground">
                No active reminders
              </p>
              <p className="text-[11px] text-muted-foreground max-w-xs leading-relaxed">
                Click the reminder button on any event to schedule
                notifications.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <ReminderList
                reminders={displayedReminders}
                onDelete={handleDelete}
                onOpen={(eventId) => navigate(`/calendar?eventId=${eventId}`)}
                isDeleting={deleteReminderMutation.isPending}
              />
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
