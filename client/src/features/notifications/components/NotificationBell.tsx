import { Bell } from "@/components/ui/icons";
import { Link } from "react-router";
import { useUnreadNotificationCount } from "../api/notifications";
import { useAuthStore } from "@/features/auth";

export function NotificationBell() {
  const user = useAuthStore((state) => state.user);
  const { data: unreadCount = 0 } = useUnreadNotificationCount();

  if (!user) return null;

  return (
    <Link
      to="/notifications"
      className="relative flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      title="Notifications"
      aria-label={
        unreadCount > 0
          ? `Notifications, ${unreadCount} unread`
          : "Notifications"
      }
    >
      <Bell className="size-4.5" />
      {unreadCount > 0 && (
        <span className="absolute -top-0.5 -right-0.5 flex min-w-[18px] h-[18px] items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white shadow-xs animate-in zoom-in-50 dark:bg-rose-600">
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      )}
    </Link>
  );
}
