import { useState } from "react";
import {
  FileText,
  Video,
  Plus,
  Calendar as CalendarIcon,
  AlertCircle,
} from "lucide-react";
import type { MockCalendarEvent, CalendarEventType } from "../data/mockCalendarData";

interface ProtoCalendarMonthViewProps {
  currentDate: Date;
  events: MockCalendarEvent[];
  onSelectEvent: (event: MockCalendarEvent) => void;
  onSelectDate: (dateStr: string) => void;
}

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function ProtoCalendarMonthView({
  currentDate,
  events,
  onSelectEvent,
  onSelectDate,
}: ProtoCalendarMonthViewProps) {
  const [dayEventsModalDate, setDayEventsModalDate] = useState<string | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0-11

  // First day of current month (0=Sun, 1=Mon, ..., 6=Sat)
  const firstDayOfMonth = new Date(year, month, 1);
  let startingDayOfWeek = firstDayOfMonth.getDay() - 1; // Convert to Mon=0 ... Sun=6
  if (startingDayOfWeek === -1) startingDayOfWeek = 6;

  // Days in current month
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Days in previous month
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  // Today ISO string for comparison (YYYY-MM-DD)
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  // Build grid calendar cells
  interface DayCell {
    dayNumber: number;
    dateStr: string;
    isCurrentMonth: boolean;
    isToday: boolean;
    events: MockCalendarEvent[];
  }

  const cells: DayCell[] = [];

  // Previous month trailing days
  for (let i = startingDayOfWeek - 1; i >= 0; i--) {
    const dayNum = daysInPrevMonth - i;
    const prevMonthDate = new Date(year, month - 1, dayNum);
    const dateStr = `${prevMonthDate.getFullYear()}-${String(prevMonthDate.getMonth() + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
    const dayEvents = events.filter((e) => e.date === dateStr);
    cells.push({
      dayNumber: dayNum,
      dateStr,
      isCurrentMonth: false,
      isToday: dateStr === todayStr,
      events: dayEvents,
    });
  }

  // Current month days
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const dayEvents = events.filter((e) => e.date === dateStr);
    cells.push({
      dayNumber: day,
      dateStr,
      isCurrentMonth: true,
      isToday: dateStr === todayStr,
      events: dayEvents,
    });
  }

  // Next month leading days to complete grid (multiples of 7)
  const remainingDays = 7 - (cells.length % 7);
  if (remainingDays < 7) {
    for (let day = 1; day <= remainingDays; day++) {
      const nextMonthDate = new Date(year, month + 1, day);
      const dateStr = `${nextMonthDate.getFullYear()}-${String(nextMonthDate.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      const dayEvents = events.filter((e) => e.date === dateStr);
      cells.push({
        dayNumber: day,
        dateStr,
        isCurrentMonth: false,
        isToday: dateStr === todayStr,
        events: dayEvents,
      });
    }
  }

  const getEventBadgeStyles = (type: CalendarEventType) => {
    switch (type) {
      case "EXAM":
        return {
          container:
            "bg-rose-500/10 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-500/30 hover:border-rose-500/60 hover:bg-rose-500/15",
          dot: "bg-rose-500",
          icon: AlertCircle,
          label: "Exam",
        };
      case "ASSIGNMENT":
        return {
          container:
            "bg-amber-500/10 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-500/30 hover:border-amber-500/60 hover:bg-amber-500/15",
          dot: "bg-amber-500",
          icon: FileText,
          label: "Assign",
        };
      case "LECTURE":
        return {
          container:
            "bg-blue-500/10 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-500/30 hover:border-blue-500/60 hover:bg-blue-500/15",
          dot: "bg-blue-500",
          icon: Video,
          label: "Lecture",
        };
    }
  };

  const modalEvents = dayEventsModalDate
    ? events.filter((e) => e.date === dayEventsModalDate)
    : [];

  return (
    <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
      {/* Weekday column headers */}
      <div className="grid grid-cols-7 border-b bg-muted/40 text-center text-xs font-semibold text-muted-foreground">
        {WEEKDAYS.map((dayName, idx) => (
          <div
            key={dayName}
            className={`py-2.5 ${idx < 6 ? "border-r" : ""} ${
              idx >= 5 ? "bg-muted/60 text-muted-foreground/80" : ""
            }`}
          >
            {dayName}
          </div>
        ))}
      </div>

      {/* Month Days Grid */}
      <div className="grid grid-cols-7 auto-rows-fr divide-y divide-border bg-border/40">
        {cells.map((cell, cellIdx) => {
          const isWeekend = cellIdx % 7 === 5 || cellIdx % 7 === 6;
          const maxVisible = 3;
          const visibleEvents = cell.events.slice(0, maxVisible);
          const overflowCount = cell.events.length - maxVisible;

          return (
            <div
              key={cell.dateStr}
              className={`group relative min-h-[110px] md:min-h-[130px] p-1.5 md:p-2 transition-colors ${
                cellIdx % 7 !== 6 ? "border-r" : ""
              } ${
                cell.isCurrentMonth
                  ? isWeekend
                    ? "bg-card/70 dark:bg-card/40"
                    : "bg-card"
                  : "bg-muted/20 text-muted-foreground/50 opacity-60"
              } hover:bg-muted/30`}
            >
              {/* Day Cell Header (Number + Quick Add Button) */}
              <div className="flex items-center justify-between">
                <span
                  className={`inline-flex size-6 items-center justify-center rounded-full text-xs font-semibold ${
                    cell.isToday
                      ? "bg-primary text-primary-foreground font-bold shadow-xs ring-2 ring-primary/30"
                      : cell.isCurrentMonth
                      ? "text-foreground group-hover:text-primary transition-colors"
                      : "text-muted-foreground"
                  }`}
                >
                  {cell.dayNumber}
                </span>

                {/* Quick Add Button on Cell Hover */}
                <button
                  type="button"
                  onClick={() => onSelectDate(cell.dateStr)}
                  title={`Register event on ${cell.dateStr}`}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded text-muted-foreground hover:text-primary hover:bg-primary/10 cursor-pointer"
                >
                  <Plus className="size-3.5" />
                </button>
              </div>

              {/* Event Pills List */}
              <div className="mt-1.5 space-y-1">
                {visibleEvents.map((ev) => {
                  const styles = getEventBadgeStyles(ev.type);
                  const Icon = styles.icon;

                  return (
                    <div
                      key={ev.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectEvent(ev);
                      }}
                      className={`flex items-center gap-1.5 rounded-md border px-1.5 py-1 text-[11px] font-medium leading-tight cursor-pointer transition-all shadow-2xs ${styles.container}`}
                      title={`${ev.courseAbbr} - ${ev.title} (${ev.startTime})`}
                    >
                      <Icon className="size-3 shrink-0" />
                      <span className="font-mono font-bold text-[10px] shrink-0 opacity-80">
                        {ev.courseAbbr}
                      </span>
                      <span className="truncate flex-1 font-normal">
                        {ev.title}
                      </span>
                      <span className="text-[9px] font-mono shrink-0 font-bold opacity-75">
                        {ev.startTime}
                      </span>
                      {ev.gradeWeight && (
                        <span className="text-[8px] font-bold rounded bg-background/50 px-1 py-0.2 shrink-0 border border-current/20">
                          {ev.gradeWeight}%
                        </span>
                      )}
                    </div>
                  );
                })}

                {/* Overflow Badge */}
                {overflowCount > 0 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDayEventsModalDate(cell.dateStr);
                    }}
                    className="w-full text-center text-[10px] font-semibold text-primary hover:underline bg-primary/5 rounded py-0.5 cursor-pointer"
                  >
                    +{overflowCount} more events
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Overflow Day Detail Modal */}
      {dayEventsModalDate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-md rounded-2xl border bg-card p-5 shadow-2xl text-card-foreground">
            <div className="flex items-center justify-between border-b pb-3 mb-3">
              <div className="flex items-center gap-2">
                <CalendarIcon className="size-4 text-primary" />
                <h3 className="font-heading font-bold text-sm">
                  Events on {dayEventsModalDate}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setDayEventsModalDate(null)}
                className="text-muted-foreground hover:text-foreground text-xs font-semibold px-2 py-1 rounded bg-muted cursor-pointer"
              >
                Close
              </button>
            </div>

            <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
              {modalEvents.map((ev) => {
                const styles = getEventBadgeStyles(ev.type);
                const Icon = styles.icon;
                return (
                  <div
                    key={ev.id}
                    onClick={() => {
                      setDayEventsModalDate(null);
                      onSelectEvent(ev);
                    }}
                    className={`rounded-xl border p-3 cursor-pointer transition-all ${styles.container}`}
                  >
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="flex items-center gap-1.5">
                        <Icon className="size-3.5" />
                        <span>[{ev.courseAbbr}] {ev.title}</span>
                      </span>
                      <span className="font-mono">{ev.startTime} {ev.endTime ? `- ${ev.endTime}` : ""}</span>
                    </div>
                    {ev.description && (
                      <p className="mt-1 text-xs opacity-90 line-clamp-2">
                        {ev.description}
                      </p>
                    )}
                    <div className="mt-2 flex items-center justify-between text-[10px] opacity-80 pt-1.5 border-t border-current/20">
                      <span>{ev.communityName}</span>
                      {ev.gradeWeight && <span>Pondere: <strong>{ev.gradeWeight}%</strong></span>}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 flex justify-between">
              <button
                type="button"
                onClick={() => {
                  const d = dayEventsModalDate;
                  setDayEventsModalDate(null);
                  onSelectDate(d);
                }}
                className="text-xs font-semibold text-primary hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Plus className="size-3.5" /> Add event on this day
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
