/**
 * Consolidated date, time, and calendar formatting utilities.
 */

/**
 * Formats a Date object to YYYY-MM-DD local date string.
 */
export function getLocalDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * Extracts YYYY-MM-DD from an ISO string using local timezone.
 */
export function getEventDateKey(isoStr: string): string {
  if (!isoStr) return "";
  const d = new Date(isoStr);
  if (isNaN(d.getTime())) return "";
  return getLocalDateKey(d);
}

/**
 * Formats a timestamp for posts and comments (e.g., "Aug 28, 2026, 11:30 AM").
 */
export function formatPostDate(dateStr?: string): string {
  if (!dateStr) return "";
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateStr;
  }
}

/**
 * Formats an ISO timestamp as a compact relative time string.
 * e.g., "now", "3m", "2h", "5d", "1w", "2mo", "1y"
 */
export function formatRelativeTime(isoStr?: string): string {
  if (!isoStr) return "";
  const then = new Date(isoStr).getTime();
  if (isNaN(then)) return "";

  const diffSeconds = Math.floor((Date.now() - then) / 1000);
  if (diffSeconds < 60) return "now";

  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) return `${diffMinutes}m`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d`;

  const diffWeeks = Math.floor(diffDays / 7);
  if (diffWeeks < 4) return `${diffWeeks}w`;

  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths < 12) return `${diffMonths}mo`;

  const diffYears = Math.floor(diffDays / 365);
  return `${diffYears}y`;
}

/**
 * Formats full date and time in 24h format (e.g., "Aug 28, 2026, 14:30").
 */
export function formatDateTime24h(
  isoStr?: string | null,
  options?: { separator?: string },
): string {
  if (!isoStr) return "";
  try {
    const d = new Date(isoStr);
    if (isNaN(d.getTime())) return isoStr;
    const datePart = d.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    const timePart = d.toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    const sep = options?.separator ?? ", ";
    return `${datePart}${sep}${timePart}`;
  } catch {
    return isoStr;
  }
}

/**
 * Formats full calendar date with weekday (e.g., "Friday, August 28, 2026").
 */
export function formatFullDate(isoStr?: string): string {
  if (!isoStr) return "";
  const d = new Date(isoStr);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * Formats time only in 24h format (e.g., "14:30").
 */
export function formatTime(isoStr?: string): string {
  if (!isoStr) return "";
  const d = new Date(isoStr);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

/**
 * Formats a duration in hours into a readable string (e.g., "1.5h", "2h", "30m").
 */
export function formatDurationHours(durationHours?: number | null): string {
  if (durationHours == null || durationHours <= 0) return "";
  if (durationHours === 1) return "1h";
  if (durationHours < 1) {
    const minutes = Math.round(durationHours * 60);
    return `${minutes}m`;
  }
  // Remove unnecessary trailing zeroes (e.g., 2.0 -> "2h", 1.5 -> "1.5h")
  const formatted = Number(durationHours.toFixed(2));
  return `${formatted}h`;
}

/**
 * Formats a start and optional end time range (e.g., "10:00 - 12:00").
 * If end time is missing or equal to start time, returns only start time.
 */
export function formatTimeRange(startTime?: string, endTime?: string): string {
  if (!startTime) return "";
  const startFormatted = formatTime(startTime);
  if (!startFormatted) return "";

  if (!endTime) return startFormatted;
  const endFormatted = formatTime(endTime);
  if (!endFormatted || endFormatted === startFormatted) return startFormatted;

  return `${startFormatted} - ${endFormatted}`;
}

/**
 * Formats event time using start time and optional duration in hours.
 * e.g., ("2026-09-01T10:00:00Z", 1.5) -> "10:00 - 11:30"
 * e.g., ("2026-09-01T20:25:00Z", null) -> "20:25"
 */
export function formatEventTimeWithDuration(
  startTime?: string,
  durationHours?: number | null,
): string {
  if (!startTime) return "";
  const startFormatted = formatTime(startTime);
  if (!startFormatted) return "";

  if (durationHours == null || durationHours <= 0) {
    return startFormatted;
  }

  const startD = new Date(startTime);
  if (isNaN(startD.getTime())) return startFormatted;

  const endD = new Date(startD.getTime() + durationHours * 3600 * 1000);
  const endFormatted = formatTime(endD.toISOString());
  if (!endFormatted || endFormatted === startFormatted) return startFormatted;

  return `${startFormatted} - ${endFormatted}`;
}

/**
 * Formats an agenda list day header with weekday, short date, and today flag.
 */
export function formatDayHeader(dateStr: string): {
  weekday: string;
  formattedDate: string;
  isToday: boolean;
} {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  const todayStr = getLocalDateKey(new Date());

  const weekday = date.toLocaleDateString(undefined, { weekday: "short" });
  const formattedDate = date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });

  return {
    weekday,
    formattedDate,
    isToday: dateStr === todayStr,
  };
}

/**
 * Formats heading date for overflow modal.
 */
export function formatHeadingDate(dateStr?: string | null): string {
  if (!dateStr) return "";
  const d = new Date(dateStr + "T00:00:00");
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * Converts an ISO string or default date string to input-compatible YYYY-MM-DDTHH:mm string.
 */
export function toDatetimeLocal(
  isoStr?: string,
  defaultDateStr?: string,
): string {
  if (isoStr) {
    const d = new Date(isoStr);
    if (!isNaN(d.getTime())) {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      const h = String(d.getHours()).padStart(2, "0");
      const min = String(d.getMinutes()).padStart(2, "0");
      return `${y}-${m}-${day}T${h}:${min}`;
    }
  }

  if (defaultDateStr) {
    return `${defaultDateStr}T23:59`;
  }

  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}T23:59`;
}

/**
 * Formats reminder offset minutes into human-readable labels.
 */
export function formatOffsetLabel(
  offsetMinutes: number,
  options?: { compact?: boolean },
): string {
  if (options?.compact) {
    if (offsetMinutes < 60) return `${offsetMinutes}m`;
    if (offsetMinutes % 10080 === 0) return `${offsetMinutes / 10080}w`;
    if (offsetMinutes % 1440 === 0) return `${offsetMinutes / 1440}d`;
    if (offsetMinutes % 60 === 0) return `${offsetMinutes / 60}h`;
    const h = Math.floor(offsetMinutes / 60);
    const m = offsetMinutes % 60;
    return `${h}h${m}m`;
  }

  if (offsetMinutes === 15) return "15 minutes before";
  if (offsetMinutes === 30) return "30 minutes before";
  if (offsetMinutes === 45) return "45 minutes before";
  if (offsetMinutes === 60) return "1 hour before";
  if (offsetMinutes % 10080 === 0) {
    const weeks = offsetMinutes / 10080;
    return `${weeks} week${weeks === 1 ? "" : "s"} before`;
  }
  if (offsetMinutes % 1440 === 0) {
    const days = offsetMinutes / 1440;
    return `${days} day${days === 1 ? "" : "s"} before`;
  }
  if (offsetMinutes % 60 === 0) {
    const hours = offsetMinutes / 60;
    return `${hours} hour${hours === 1 ? "" : "s"} before`;
  }
  return `${offsetMinutes} minutes before`;
}

/**
 * Formats a relative countdown or timeline status for an event start time.
 * e.g., "Starts in 2 days", "Starts in 3h", "Starts in 45m", "Happening now", "Concluded"
 */
export function formatEventRelativeStatus(
  startTime?: string,
  durationHours?: number | null,
  options?: { verb?: string },
): { label: string; isPast: boolean; isOngoing: boolean; isSoon: boolean } {
  if (!startTime) {
    return { label: "", isPast: false, isOngoing: false, isSoon: false };
  }
  const startMs = new Date(startTime).getTime();
  if (isNaN(startMs)) {
    return { label: "", isPast: false, isOngoing: false, isSoon: false };
  }
  const nowMs = Date.now();
  const endMs =
    durationHours && durationHours > 0
      ? startMs + durationHours * 60 * 60 * 1000
      : startMs;
  const verb = options?.verb ?? "Starts";

  if (nowMs > endMs) {
    return {
      label: "Concluded",
      isPast: true,
      isOngoing: false,
      isSoon: false,
    };
  }
  if (nowMs >= startMs && nowMs <= endMs) {
    return {
      label: "Happening now",
      isPast: false,
      isOngoing: true,
      isSoon: true,
    };
  }

  const diffMs = startMs - nowMs;
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMinutes < 60) {
    return {
      label: `${verb} in ${diffMinutes}m`,
      isPast: false,
      isOngoing: false,
      isSoon: true,
    };
  }
  if (diffHours < 24) {
    return {
      label: `${verb} in ${diffHours}h`,
      isPast: false,
      isOngoing: false,
      isSoon: true,
    };
  }
  if (diffDays === 1) {
    return {
      label: `${verb} tomorrow`,
      isPast: false,
      isOngoing: false,
      isSoon: false,
    };
  }
  return {
    label: `In ${diffDays} days`,
    isPast: false,
    isOngoing: false,
    isSoon: false,
  };
}

export function getTime(
  date: Date,
  unit: "weeks" | "days" | "hours" | "minutes" | "seconds" | "milliseconds",
) {
  const time = date.getTime();
  switch (unit) {
    case "weeks":
      return time / (1000 * 60 * 60 * 24 * 7);
    case "days":
      return time / (1000 * 60 * 60 * 24);
    case "hours":
      return time / (1000 * 60 * 60);
    case "minutes":
      return time / (1000 * 60);
    case "seconds":
      return time / 1000;
    case "milliseconds":
      return time;
    default:
      throw new Error(`Unsupported unit: ${unit}`);
  }
}
