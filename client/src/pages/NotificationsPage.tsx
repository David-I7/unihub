import {
  Bell,
  Calendar,
  CheckCheck,
  Info,
  MessageSquare,
} from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

  return (
    <div className="min-h-full space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <h1 className="font-heading text-2xl md:text-3xl font-bold tracking-tight text-foreground">
          Notifications
        </h1>

        {totalUnread > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => markAllRead()}
            disabled={isMarkingAll}
            className="text-xs font-semibold cursor-pointer"
          >
            <CheckCheck className="size-4 mr-1.5" />
            <span>Mark all as read</span>
          </Button>
        )}
      </div>

      {/* Tabs and Content */}
      <Tabs
        value={filters.category}
        onValueChange={(val) =>
          setFilters({ category: val as CategoryTab, unread: false })
        }
        className="w-full space-y-6 min-w-0"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4">
          <div className="w-full sm:w-auto overflow-x-auto no-scrollbar">
            <TabsList className="h-10 p-1 bg-muted/60 rounded-xl gap-1 flex-nowrap shrink-0">
              <TabsTrigger value="all">
                <Bell className="size-4" />
                <span>All</span>
              </TabsTrigger>
              <TabsTrigger value="event">
                <Calendar className="size-4" />
                <span>Events</span>
              </TabsTrigger>
              <TabsTrigger value="post">
                <MessageSquare className="size-4" />
                <span>Posts</span>
              </TabsTrigger>
              <TabsTrigger value="system">
                <Info className="size-4" />
                <span>System</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
            <Switch
              id="unread-only"
              checked={isUnreadOnly}
              onCheckedChange={handleUnreadToggle}
            />
            <Label
              htmlFor="unread-only"
              className="text-xs text-muted-foreground cursor-pointer select-none"
            >
              Unread only
            </Label>
          </div>
        </div>

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
      </Tabs>
    </div>
  );
}
