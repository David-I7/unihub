import {
  Bell,
  Calendar,
  Check,
  GraduationCap,
  Heart,
  Info,
  MessageSquare,
  Users,
} from "@/components/ui/icons";
import {
  CalendarOff,
  Megaphone,
  Wrench,
} from "lucide-react";
import type { AppNotification } from "../api/types";
import { useMarkNotificationAsRead } from "../api/notifications";
import { useNotificationNavigation } from "../hooks/useNotificationNavigation";
import { formatPostDate } from "@/lib/dateUtils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface NotificationItemProps {
  notification: AppNotification;
}

function getNotificationIcon(notification: AppNotification) {
  if (notification.category === "EVENT") {
    switch (notification.type) {
      case "REMINDER":
        return {
          icon: Bell,
          className: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
        };
      case "CANCELLED":
        return {
          icon: CalendarOff,
          className: "bg-destructive/10 text-destructive",
        };
      case "UPDATED":
      default:
        return {
          icon: Calendar,
          className: "bg-primary/10 text-primary",
        };
    }
  }

  if (notification.category === "POST") {
    switch (notification.type) {
      case "LIKE":
        return {
          icon: Heart,
          className: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
        };
      case "COMMENT":
        return {
          icon: MessageSquare,
          className: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
        };
      case "COURSE_POST":
        return {
          icon: GraduationCap,
          className: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
        };
      case "COMMUNITY_POST":
      default:
        return {
          icon: Users,
          className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
        };
    }
  }

  // SYSTEM
  switch (notification.type) {
    case "ANNOUNCEMENT":
      return {
        icon: Megaphone,
        className: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
      };
    case "MAINTENANCE":
      return {
        icon: Wrench,
        className: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
      };
    case "GENERAL":
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
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <h4
              className={cn(
                "text-sm truncate",
                notification.isRead
                  ? "font-medium text-foreground"
                  : "font-bold text-foreground",
              )}
            >
              {notification.title}
            </h4>
            {!notification.isRead && (
              <span className="size-2 rounded-full bg-primary shrink-0" />
            )}
          </div>

          <span className="text-[11px] text-muted-foreground shrink-0 whitespace-nowrap">
            {formatPostDate(notification.createdAt)}
          </span>
        </div>

        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
          {notification.message}
        </p>

        {/* Metadata Badges */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <Badge
            variant="secondary"
            className="text-[10px] px-1.5 py-0 font-medium uppercase tracking-wider"
          >
            {notification.category}
          </Badge>

          {"communitySlug" in notification && notification.communitySlug && (
            <span className="text-[11px] text-muted-foreground bg-muted/60 px-1.5 py-0.5 rounded font-medium">
              {notification.communitySlug}
            </span>
          )}

          {"courseSlug" in notification && notification.courseSlug && (
            <span className="text-[11px] text-muted-foreground bg-muted/60 px-1.5 py-0.5 rounded font-mono">
              {notification.courseSlug}
            </span>
          )}

          {"actor" in notification && notification.actor?.username && (
            <span className="text-[11px] text-muted-foreground">
              by @{notification.actor.username}
            </span>
          )}
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
