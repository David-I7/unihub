import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import type { AppNotification, NotificationCategory } from "../api/types";
import { NotificationItem } from "./NotificationItem";
import { NotificationSkeleton } from "./NotificationSkeleton";
import { NotificationEmptyState } from "./NotificationEmptyState";
import { groupNotificationsByTime } from "../lib/notificationGrouping";

interface NotificationListProps {
  notifications: AppNotification[];
  isLoading: boolean;
  isFetchingNextPage: boolean;
  hasNextPage: boolean;
  fetchNextPage: () => void;
  onRetry?: () => void;
  category?: NotificationCategory;
  isUnreadOnly?: boolean;
}

export function NotificationList({
  notifications,
  isLoading,
  isFetchingNextPage,
  hasNextPage,
  fetchNextPage,
  category,
  isUnreadOnly,
}: NotificationListProps) {
  if (isLoading) {
    return <NotificationSkeleton />;
  }

  if (notifications.length === 0) {
    return (
      <NotificationEmptyState
        category={category}
        isUnreadOnly={isUnreadOnly}
      />
    );
  }

  const groups = groupNotificationsByTime(notifications);

  return (
    <div className="space-y-6">
      {groups.map((group) => (
        <section key={group.key} className="space-y-2.5">
          <div className="flex items-center gap-2 px-1">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {group.label}
            </h3>
            <span className="text-[11px] font-medium text-muted-foreground/70 bg-muted/80 px-1.5 py-0.2 rounded-full">
              {group.notifications.length}
            </span>
          </div>

          <div className="space-y-2.5">
            {group.notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
              />
            ))}
          </div>
        </section>
      ))}

      {hasNextPage && (
        <div className="flex justify-center pt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            className="gap-2 font-semibold text-xs cursor-pointer"
          >
            {isFetchingNextPage ? (
              <>
                <Spinner className="size-3.5" /> Loading more...
              </>
            ) : (
              "Load more notifications"
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
