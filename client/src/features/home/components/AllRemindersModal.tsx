import { useNavigate } from "react-router";
import { toast } from "sonner";
import { Bell, CheckCircle2 } from "lucide-react";
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
} from "@/features/calendar";
import { getErrorMessage } from "@/api/types";
import ReminderList from "./ReminderList";

interface AllRemindersModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AllRemindersModal({
  open,
  onOpenChange,
}: AllRemindersModalProps) {
  const navigate = useNavigate();
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
      <DialogContent className="sm:max-w-lg max-h-[85vh] flex flex-col gap-4">
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

        <div className="flex-1 space-y-2.5 pr-1 min-h-[220px]">
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
            <div className="space-y-2 pb-4">
              <ReminderList
                onDelete={handleDelete}
                reminders={reminders}
                isDeleting={deleteReminderMutation.isPending}
                onOpen={(eventId) => {
                  onOpenChange(false);
                  navigate(`/calendar?eventId=${eventId}`);
                }}
              />

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
