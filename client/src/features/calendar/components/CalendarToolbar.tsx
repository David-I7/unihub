import { ChevronLeft, ChevronRight } from "@/components/ui/icons";
import { LayoutGrid, List } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCalendarStore } from "../store/useCalendarStore";
import { CalendarFilters } from "./CalendarFilters";
import { useUrlFilters } from "@/hooks/useUrlFilters";
import { CALENDAR_FILTER_SCHEMA } from "../schemas/calendarFilterSchema";

interface CalendarToolbarProps {
  examCount: number;
  assignmentCount: number;
  lectureCount: number;
  totalCount: number;
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
}: CalendarToolbarProps) {
  const currentDate = useCalendarStore((s) => s.currentDate);
  const viewMode = useCalendarStore((s) => s.viewMode);
  const { setFilters } = useUrlFilters(CALENDAR_FILTER_SCHEMA);

  const monthName = MONTH_NAMES[currentDate.getMonth()];
  const yearNumber = currentDate.getFullYear();

  const handlePrevMonth = () => {
    const prev = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() - 1,
      1,
    );
    setFilters({ year: prev.getFullYear(), month: prev.getMonth() + 1 });
  };

  const handleNextMonth = () => {
    const next = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      1,
    );
    setFilters({ year: next.getFullYear(), month: next.getMonth() + 1 });
  };

  const handleToday = () => {
    const today = new Date();
    setFilters({ year: today.getFullYear(), month: today.getMonth() + 1 });
  };

  const handleViewModeChange = (val: string) => {
    setFilters({ view: val as "auto" | "month" | "list" });
  };

  return (
    <div className="rounded-2xl border bg-card p-4 sm:p-5 shadow-xs space-y-4">
      {/* Top Row: Date Navigation & Action Buttons */}
      <div className="flex flex-row items-center justify-between gap-4 flex-wrap">
        {/* Navigation Controls + Month Title */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 rounded-xl border bg-muted/40 p-1">
            <button
              type="button"
              onClick={handlePrevMonth}
              title="Previous Month"
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-background transition-colors cursor-pointer"
            >
              <ChevronLeft className="size-4" />
            </button>
            <button
              type="button"
              onClick={handleToday}
              className="px-3 py-1 text-xs font-semibold rounded-lg text-foreground hover:bg-background transition-colors cursor-pointer"
            >
              Today
            </button>
            <button
              type="button"
              onClick={handleNextMonth}
              title="Next Month"
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-background transition-colors cursor-pointer"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>

          <h2 className="font-heading shrink-0 text-lg md:text-xl font-extrabold text-foreground tracking-tight">
            {monthName} {yearNumber}
          </h2>
        </div>

        {/* Right Action buttons (View Switcher Tabs & Add Event) */}
        <div className="flex flex-wrap items-center gap-3">
          <Tabs
            value={viewMode}
            onValueChange={handleViewModeChange}
            className="w-auto"
          >
            <TabsList className="h-9 p-1 bg-muted/60 rounded-xl gap-1">
              <TabsTrigger
                value="auto"
                className="h-7 text-xs px-2.5"
                title="Auto responsive mode"
              >
                Auto
              </TabsTrigger>
              <TabsTrigger
                value="month"
                className="h-7 px-2"
                title="Month grid view"
              >
                <LayoutGrid className="size-3.5" />
              </TabsTrigger>
              <TabsTrigger
                value="list"
                className="h-7 px-2"
                title="Agenda list view"
              >
                <List className="size-3.5" />
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Filter Selectors and Standard Search Input */}
      <CalendarFilters
        examCount={examCount}
        assignmentCount={assignmentCount}
        lectureCount={lectureCount}
        totalCount={totalCount}
      />
    </div>
  );
}
