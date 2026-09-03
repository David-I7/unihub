import { useMemo } from "react";
import type { CalendarEvent } from "../api/types";
import { CalendarDayCell } from "./CalendarDayCell";
import { getEventDateKey, getLocalDateKey } from "@/lib/dateUtils";

interface CalendarMonthGridProps {
  currentDate: Date;
  events: CalendarEvent[];
  canCreateEvent?: boolean;
}

const WEEKDAYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];


interface GridCell {
  dayNumber: number;
  dateStr: string;
  isCurrentMonth: boolean;
  isToday: boolean;
  isWeekend: boolean;
  events: CalendarEvent[];
}

export function CalendarMonthGrid({
  currentDate,
  events,
  canCreateEvent = true,
}: CalendarMonthGridProps) {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0-11

  // Group events by date string
  const eventsByDate = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    for (const ev of events) {
      const key = getEventDateKey(ev.startTime);
      if (!key) continue;
      if (!map.has(key)) {
        map.set(key, []);
      }
      map.get(key)!.push(ev);
    }
    // Sort events within each day by startTime
    for (const list of map.values()) {
      list.sort(
        (a, b) =>
          new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
      );
    }
    return map;
  }, [events]);

  const cells: GridCell[] = useMemo(() => {
    const result: GridCell[] = [];
    const todayStr = getLocalDateKey(new Date());

    // First day of current month (0=Sun, 1=Mon, ..., 6=Sat)
    const firstDayOfMonth = new Date(year, month, 1);
    let startingDayOfWeek = firstDayOfMonth.getDay() - 1; // Mon=0 ... Sun=6
    if (startingDayOfWeek === -1) startingDayOfWeek = 6;

    // Days in current & previous months
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    // Trailing days from previous month
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const dayNum = daysInPrevMonth - i;
      const prevDate = new Date(year, month - 1, dayNum);
      const dateStr = getLocalDateKey(prevDate);
      const dayOfWeek = prevDate.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

      result.push({
        dayNumber: dayNum,
        dateStr,
        isCurrentMonth: false,
        isToday: dateStr === todayStr,
        isWeekend,
        events: eventsByDate.get(dateStr) ?? [],
      });
    }

    // Days in current month
    for (let day = 1; day <= daysInMonth; day++) {
      const curDate = new Date(year, month, day);
      const dateStr = getLocalDateKey(curDate);
      const dayOfWeek = curDate.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

      result.push({
        dayNumber: day,
        dateStr,
        isCurrentMonth: true,
        isToday: dateStr === todayStr,
        isWeekend,
        events: eventsByDate.get(dateStr) ?? [],
      });
    }

    // Leading days from next month to complete standard weeks
    const remainingDays = 7 - (result.length % 7);
    if (remainingDays < 7) {
      for (let day = 1; day <= remainingDays; day++) {
        const nextDate = new Date(year, month + 1, day);
        const dateStr = getLocalDateKey(nextDate);
        const dayOfWeek = nextDate.getDay();
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

        result.push({
          dayNumber: day,
          dateStr,
          isCurrentMonth: false,
          isToday: dateStr === todayStr,
          isWeekend,
          events: eventsByDate.get(dateStr) ?? [],
        });
      }
    }

    return result;
  }, [year, month, eventsByDate]);

  return (
    <div className="overflow-hidden rounded-2xl border bg-card shadow-xs">
      {/* Weekday Column Headers */}
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
        {cells.map((cell, cellIdx) => (
          <CalendarDayCell
            key={cell.dateStr + "-" + cellIdx}
            dayNumber={cell.dayNumber}
            dateStr={cell.dateStr}
            isCurrentMonth={cell.isCurrentMonth}
            isToday={cell.isToday}
            isWeekend={cell.isWeekend}
            events={cell.events}
            borderRight={cellIdx % 7 !== 6}
            canCreateEvent={canCreateEvent}
          />
        ))}
      </div>
    </div>
  );
}
