import type { AppNotification } from "../api/types";

export type TimeGroupKey = "THIS_WEEK" | "SEVEN_DAYS_AGO" | "ONE_MONTH_AGO" | "OLDER";

export interface NotificationGroup {
  key: TimeGroupKey;
  label: string;
  notifications: AppNotification[];
}

export function groupNotificationsByTime(notifications: AppNotification[]): NotificationGroup[] {
  const groups: Record<TimeGroupKey, AppNotification[]> = {
    THIS_WEEK: [],
    SEVEN_DAYS_AGO: [],
    ONE_MONTH_AGO: [],
    OLDER: [],
  };

  const now = Date.now();
  const ONE_DAY_MS = 24 * 60 * 60 * 1000;

  for (const notification of notifications) {
    const createdTime = new Date(notification.createdAt).getTime();
    if (isNaN(createdTime)) {
      groups.OLDER.push(notification);
      continue;
    }

    const diffDays = (now - createdTime) / ONE_DAY_MS;

    if (diffDays < 7) {
      groups.THIS_WEEK.push(notification);
    } else if (diffDays < 30) {
      groups.SEVEN_DAYS_AGO.push(notification);
    } else if (diffDays < 60) {
      groups.ONE_MONTH_AGO.push(notification);
    } else {
      groups.OLDER.push(notification);
    }
  }

  const groupConfigs: { key: TimeGroupKey; label: string }[] = [
    { key: "THIS_WEEK", label: "This week" },
    { key: "SEVEN_DAYS_AGO", label: "7 days ago" },
    { key: "ONE_MONTH_AGO", label: "1 month ago" },
    { key: "OLDER", label: "Older" },
  ];

  return groupConfigs
    .filter((config) => groups[config.key].length > 0)
    .map((config) => ({
      key: config.key,
      label: config.label,
      notifications: groups[config.key],
    }));
}
