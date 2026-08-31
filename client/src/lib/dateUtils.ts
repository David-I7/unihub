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
 * Formats full date and time in 24h format (e.g., "Aug 28, 2026, 14:30").
 */
export function formatDateTime24h(isoStr?: string | null): string {
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
    return `${datePart}, ${timePart}`;
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
 * Formats a start and optional end time range (e.g., "10:00 - 12:00").
 */
export function formatTimeRange(startTime?: string, endTime?: string): string {
  if (!startTime) return "";
  const startFormatted = formatTime(startTime);
  if (!startFormatted) return "";

  if (!endTime) return startFormatted;
  const endFormatted = formatTime(endTime);
  if (!endFormatted) return startFormatted;

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
export function toDatetimeLocal(isoStr?: string, defaultDateStr?: string): string {
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
    return `${defaultDateStr}T09:00`;
  }

  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}T09:00`;
}

/**
 * Formats reminder offset minutes into human-readable labels.
 */
export function formatOffsetLabel(offsetMinutes: number): string {
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
