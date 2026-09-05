import { memo, useLayoutEffect, useRef, useState } from "react";
import {
  Bell,
  Calendar,
  Check,
  Heart,
  Info,
  MessageSquare,
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

export const NotificationItem = memo(function NotificationItem({
  notification,
}: NotificationItemProps) {
  const { handleNotificationClick } = useNotificationNavigation();
  const { mutate: markRead, isPending: isMarkingRead } =
    useMarkNotificationAsRead();

  const [isExpanded, setIsExpanded] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const messageRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = messageRef.current;
    if (!el) return;
    setIsOverflowing(el.scrollHeight > el.clientHeight);
  }, [notification.message]);

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
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div
              ref={messageRef}
              className={cn(
                "text-sm leading-relaxed",
                !isExpanded && "line-clamp-2",
              )}
            >
              {notification.actor && (
                <span className="text-sm font-semibold leading-none">
                  {notification.actor.username}{" "}
                </span>
              )}
              {notification.message}
              {isExpanded && isOverflowing && (
                <Button
                  variant="link"
                  size="link"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsExpanded(false);
                  }}
                  className="text-muted-foreground inline text-xs font-semibold h-auto p-0 ml-1 cursor-pointer"
                >
                  See less
                </Button>
              )}
            </div>

            <div className="flex items-center gap-1.5 mt-0.5">
              {!isExpanded && isOverflowing && (
                <Button
                  variant="link"
                  size="link"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsExpanded(true);
                  }}
                  className="text-muted-foreground text-xs font-semibold h-auto p-0 cursor-pointer"
                >
                  See more
                </Button>
              )}
              <span className="text-[11px] text-muted-foreground whitespace-nowrap">
                {formatRelativeTime(notification.createdAt)} ago
              </span>
            </div>
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
});
