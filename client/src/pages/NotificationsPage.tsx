import { Bell, CheckCheck } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { FilterSelect } from "@/components/app/FilterSelect";
import { FilterToggle } from "@/components/app/FilterToggle";
import {
  useInfiniteNotifications,
  useMarkAllNotificationsAsRead,
  useUnreadNotificationCount,
  type NotificationCategory,
  NotificationList,
} from "@/features/notifications";
import { useUrlFilters, type FilterSchema } from "@/hooks/useUrlFilters";

const VALID_CATEGORIES = ["all", "event", "post", "system"] as const;
type CategoryTab = (typeof VALID_CATEGORIES)[number];

const NOTIFICATION_TYPE_OPTIONS = [
  { value: "all", label: "All Types" },
  { value: "event", label: "Events" },
  { value: "post", label: "Posts" },
  { value: "system", label: "System" },
];

interface NotificationsFilters {
  category: CategoryTab;
  unread: boolean;
}

const NOTIFICATIONS_FILTER_SCHEMA: FilterSchema<NotificationsFilters> = {
  category: {
    defaultValue: "all",
    allowedValues: VALID_CATEGORIES,
    paramKey: "category",
  },
  unread: {
    defaultValue: false,
    type: "boolean",
    paramKey: "unread",
  },
};

export default function NotificationsPage() {
  const { filters, setFilters, setFilter } = useUrlFilters(
    NOTIFICATIONS_FILTER_SCHEMA,
  );

  const category: NotificationCategory | undefined =
    filters.category === "event" ||
    filters.category === "post" ||
    filters.category === "system"
      ? (filters.category.toUpperCase() as NotificationCategory)
      : undefined;

  const isUnreadOnly = filters.unread;

  const { data: totalUnread = 0 } = useUnreadNotificationCount();
  const { mutate: markAllRead, isPending: isMarkingAll } =
    useMarkAllNotificationsAsRead();

  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch,
  } = useInfiniteNotifications({
    category,
    isRead: isUnreadOnly ? false : undefined,
  });

  const notifications = data?.pages.flatMap((page) => page.content) ?? [];

  const handleUnreadToggle = (checked: boolean) => {
    setFilter("unread", checked);
  };

  const hasActiveFilters = filters.category !== "all" || filters.unread;

  return (
    <div className="min-h-full space-y-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="font-heading text-2xl md:text-3xl font-bold tracking-tight text-foreground">
          Notifications
        </h1>
      </div>

      {/* Toolbar: Filter by Type + Filter by Unread + Reset */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex flex-wrap items-center gap-2">
          <FilterSelect
            label="Type"
            placeholder="Select Type"
            value={filters.category}
            onChange={(val) => setFilter("category", val as CategoryTab)}
            options={NOTIFICATION_TYPE_OPTIONS}
            defaultValue="all"
            icon={Bell}
          />

          <FilterToggle
            label="Unread only"
            icon={CheckCheck}
            checked={isUnreadOnly}
            onCheckedChange={handleUnreadToggle}
          />

          {hasActiveFilters && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setFilters({ category: "all", unread: false })}
              className="text-xs text-muted-foreground hover:text-foreground rounded-xl"
            >
              Reset
            </Button>
          )}
        </div>
      </div>

      {/* Dedicated Action Row */}
      {totalUnread > 0 && (
        <div className="flex justify-end">
          <Button
            size="sm"
            onClick={() => markAllRead()}
            disabled={isMarkingAll}
          >
            <CheckCheck />
            <span>Mark all as read</span>
          </Button>
        </div>
      )}

      {/* Notification List */}
      <NotificationList
        notifications={notifications}
        isLoading={isLoading}
        isFetchingNextPage={isFetchingNextPage}
        hasNextPage={Boolean(hasNextPage)}
        fetchNextPage={fetchNextPage}
        onRetry={() => refetch()}
        category={category}
        isUnreadOnly={isUnreadOnly}
      />
    </div>
  );
}
