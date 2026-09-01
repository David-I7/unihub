import { CheckCircle2 } from "@/components/ui/icons";
import { BellOff } from "lucide-react";
import type { NotificationCategory } from "../api/types";

interface NotificationEmptyStateProps {
  category?: NotificationCategory;
  isUnreadOnly?: boolean;
}

export function NotificationEmptyState({
  category,
  isUnreadOnly,
}: NotificationEmptyStateProps) {
  if (isUnreadOnly) {
    return (
      <div className="flex min-h-[320px] flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/50 p-8 text-center">
        <div className="flex size-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mb-3">
          <CheckCircle2 className="size-6" />
        </div>
        <h3 className="font-heading text-base font-semibold text-foreground">
          All caught up!
        </h3>
        <p className="mt-1 text-xs text-muted-foreground max-w-xs">
          You have no unread notifications in this view.
        </p>
      </div>
    );
  }

  const categoryLabel = category
    ? category === "EVENT"
      ? "event"
      : category === "POST"
        ? "post"
        : "system"
    : "";

  return (
    <div className="flex min-h-[320px] flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/50 p-8 text-center">
      <div className="flex size-12 items-center justify-center rounded-xl bg-muted text-muted-foreground mb-3">
        <BellOff className="size-6" />
      </div>
      <h3 className="font-heading text-base font-semibold text-foreground">
        No notifications
      </h3>
      <p className="mt-1 text-xs text-muted-foreground max-w-xs">
        {categoryLabel
          ? `You don't have any ${categoryLabel} notifications yet.`
          : "When you receive announcements, reminders, or updates, they will appear here."}
      </p>
    </div>
  );
}
