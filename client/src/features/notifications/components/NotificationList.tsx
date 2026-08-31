import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import type { AppNotification, NotificationCategory } from "../api/types";
import { NotificationItem } from "./NotificationItem";
import { NotificationSkeleton } from "./NotificationSkeleton";
import { NotificationEmptyState } from "./NotificationEmptyState";

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

  return (
    <div className="space-y-2.5">
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
        />
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
