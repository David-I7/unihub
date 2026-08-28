import {
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  List,
  Plus,
} from "lucide-react";
import { useCalendarStore } from "../store/useCalendarStore";
import { CalendarFilters } from "./CalendarFilters";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CalendarToolbarProps {
  examCount: number;
  assignmentCount: number;
  lectureCount: number;
  totalCount: number;
  canCreateEvent?: boolean;
}

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export function CalendarToolbar({
  examCount,
  assignmentCount,
  lectureCount,
  totalCount,
  canCreateEvent = true,
}: CalendarToolbarProps) {
  const currentDate = useCalendarStore((s) => s.currentDate);
  const viewMode = useCalendarStore((s) => s.viewMode);
  const goToPrevMonth = useCalendarStore((s) => s.goToPrevMonth);
  const goToNextMonth = useCalendarStore((s) => s.goToNextMonth);
  const goToToday = useCalendarStore((s) => s.goToToday);
  const setViewMode = useCalendarStore((s) => s.setViewMode);
  const openCreateModal = useCalendarStore((s) => s.openCreateModal);

  const monthName = MONTH_NAMES[currentDate.getMonth()];
  const yearNumber = currentDate.getFullYear();

  return (
    <div className="rounded-2xl border bg-card p-4 shadow-xs space-y-4">
      {/* Top Row: Date Navigation & Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Navigation Controls + Month Title */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 rounded-xl border bg-muted/40 p-1">
            <button
              type="button"
              onClick={goToPrevMonth}
              title="Previous Month"
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-background transition-colors cursor-pointer"
            >
              <ChevronLeft className="size-4" />
            </button>
            <button
              type="button"
              onClick={goToToday}
              className="px-3 py-1 text-xs font-semibold rounded-lg text-foreground hover:bg-background transition-colors cursor-pointer"
            >
              Today
            </button>
            <button
              type="button"
              onClick={goToNextMonth}
              title="Next Month"
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-background transition-colors cursor-pointer"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>

          <h2 className="font-heading text-lg md:text-xl font-extrabold text-foreground tracking-tight">
            {monthName} {yearNumber}
          </h2>
        </div>

        {/* Right Action buttons (View Switcher & Add Event) */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-0.5 rounded-xl border bg-muted/40 p-1 text-xs">
            <button
              type="button"
              onClick={() => setViewMode("auto")}
              className={cn(
                "px-2 py-1 text-[11px] font-semibold rounded-lg transition-colors cursor-pointer",
                viewMode === "auto"
                  ? "bg-background text-foreground shadow-2xs font-bold"
                  : "text-muted-foreground hover:text-foreground",
              )}
              title="Auto responsive mode (<640px = list, >=640px = grid)"
            >
              Auto
            </button>
            <button
              type="button"
              onClick={() => setViewMode("month")}
              className={cn(
                "p-1.5 rounded-lg transition-colors cursor-pointer",
                viewMode === "month"
                  ? "bg-background text-primary shadow-2xs"
                  : "text-muted-foreground hover:text-foreground",
              )}
              title="Month grid view"
            >
              <LayoutGrid className="size-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={cn(
                "p-1.5 rounded-lg transition-colors cursor-pointer",
                viewMode === "list"
                  ? "bg-background text-primary shadow-2xs"
                  : "text-muted-foreground hover:text-foreground",
              )}
              title="Agenda list view"
            >
              <List className="size-3.5" />
            </button>
          </div>

          {/* Add Event Button */}
          <Button
            size="sm"
            onClick={() => openCreateModal()}
            disabled={!canCreateEvent}
            className="gap-1.5 font-semibold text-xs h-9 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="size-4" />
            Add Event
          </Button>
        </div>
      </div>

      {/* Filter Selectors and Search Input */}
      <CalendarFilters
        examCount={examCount}
        assignmentCount={assignmentCount}
        lectureCount={lectureCount}
        totalCount={totalCount}
      />
    </div>
  );
}
