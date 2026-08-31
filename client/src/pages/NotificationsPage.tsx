import { useSearchParams } from "react-router";
import { Bell, Calendar, CheckCheck, Info, MessageSquare } from "lucide-react";
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

export default function NotificationsPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const rawCategory = searchParams.get("category")?.toUpperCase();
  const category: NotificationCategory | undefined =
    rawCategory === "EVENT" ||
    rawCategory === "POST" ||
    rawCategory === "SYSTEM"
      ? rawCategory
      : undefined;

  const currentTab = category ? category.toLowerCase() : "all";
  const isUnreadOnly = searchParams.get("unread") === "true";

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

  const handleTabChange = (nextTab: string) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (nextTab === "all") {
          next.delete("category");
        } else {
          next.set("category", nextTab);
        }
        return next;
      },
      { replace: true },
    );
  };

  const handleUnreadToggle = (checked: boolean) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (checked) {
          next.set("unread", "true");
        } else {
          next.delete("unread");
        }
        return next;
      },
      { replace: true },
    );
  };

  return (
    <div className="min-h-full space-y-6 pb-12">
      {/* Simple Header */}
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
            Mark all as read
          </Button>
        )}
      </div>

      {/* Tabs and Content */}
      <Tabs
        value={currentTab}
        onValueChange={handleTabChange}
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
