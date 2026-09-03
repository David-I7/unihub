import {
  Bell,
  Calendar,
  Check,
  Heart,
  Info,
  MessageSquare,
  Users,
} from "@/components/ui/icons";
import { CalendarOff, Megaphone, Wrench } from "lucide-react";
import type { AppNotification } from "../api/types";
import { useMarkNotificationAsRead } from "../api/notifications";
import { useNotificationNavigation } from "../hooks/useNotificationNavigation";
import { formatRelativeTime } from "@/lib/dateUtils";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface NotificationItemProps {
  notification: AppNotification;
}

function getNotificationIcon(notification: AppNotification) {
  switch (notification.type) {
    case "EVENT_REMINDER":
      return {
        icon: Bell,
        className: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
      };
    case "EVENT_CANCELLED":
      return {
        icon: CalendarOff,
        className: "bg-destructive/10 text-destructive",
      };
    case "EVENT_UPDATED":
      return {
        icon: Calendar,
        className: "bg-primary/10 text-primary",
      };
    case "POST_LIKE":
      return {
        icon: Heart,
        className: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
      };
    case "POST_COMMENT":
    case "COURSE_POST":
    case "COMMUNITY_POST":
      return {
        icon: MessageSquare,
        className: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
      };
    case "SYSTEM_ANNOUNCEMENT":
      return {
        icon: Megaphone,
        className: "bg-muted text-muted-foreground",
      };
    case "SYSTEM_MAINTENANCE":
      return {
        icon: Wrench,
        className: "bg-muted text-muted-foreground",
      };
    case "SYSTEM_GENERAL":
    default:
      return {
        icon: Info,
        className: "bg-muted text-muted-foreground",
      };
  }
}

export function NotificationItem({ notification }: NotificationItemProps) {
  const { handleNotificationClick } = useNotificationNavigation();
  const { mutate: markRead, isPending: isMarkingRead } =
    useMarkNotificationAsRead();

  const { icon: Icon, className: iconClass } =
    getNotificationIcon(notification);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => handleNotificationClick(notification)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleNotificationClick(notification);
        }
      }}
      className={cn(
        "group relative flex items-start gap-3.5 p-4 rounded-2xl border transition-all cursor-pointer select-none text-left",
        notification.isRead
          ? "bg-card border-border/60 hover:border-border hover:bg-muted/20"
          : "bg-primary/[0.03] border-primary/25 hover:border-primary/40 hover:bg-primary/[0.05]",
      )}
    >
      {/* Type Icon */}
      <div
        className={cn(
          "flex size-9 shrink-0 items-center justify-center rounded-xl",
          iconClass,
        )}
      >
        <Icon className="size-4.5" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 space-y-1.5">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="text-sm line-clamp-2 leading-relaxed">
              {notification.actor && (
                <span className="text-sm font-semibold leading-none">
                  {notification.actor.username}{" "}
                </span>
              )}
              <p className="inline">{notification.message}</p>
            </div>

            <span className="text-[11px] inline text-muted-foreground shrink-0 whitespace-nowrap px-1">
              {formatRelativeTime(notification.createdAt)} ago
            </span>
          </div>
        </div>
      </div>

      {/* Quick Mark Read Action (Visible on hover when unread) */}
      {!notification.isRead && (
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={(e) => {
            e.stopPropagation();
            markRead(notification.id);
          }}
          disabled={isMarkingRead}
          title="Mark as read"
          className="opacity-0 group-hover:opacity-100 transition-opacity size-7 shrink-0 text-muted-foreground hover:text-foreground cursor-pointer"
        >
          <Check className="size-3.5" />
        </Button>
      )}
    </div>
  );
}
