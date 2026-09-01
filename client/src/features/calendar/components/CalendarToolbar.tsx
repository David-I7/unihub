import { ChevronLeft, ChevronRight } from "@/components/ui/icons";
import { LayoutGrid, List } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCalendarStore } from "../store/useCalendarStore";
import { CalendarFilters } from "./CalendarFilters";

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
  const goToPrevMonth = useCalendarStore((s) => s.goToPrevMonth);
  const goToNextMonth = useCalendarStore((s) => s.goToNextMonth);
  const goToToday = useCalendarStore((s) => s.goToToday);
  const setViewMode = useCalendarStore((s) => s.setViewMode);

  const monthName = MONTH_NAMES[currentDate.getMonth()];
  const yearNumber = currentDate.getFullYear();

  return (
    <div className="rounded-2xl border bg-card p-4 sm:p-5 shadow-xs space-y-4">
      {/* Top Row: Date Navigation & Action Buttons */}
      <div className="flex flex-row items-center justify-between gap-4 flex-wrap">
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

          <h2 className="font-heading shrink-0 text-lg md:text-xl font-extrabold text-foreground tracking-tight">
            {monthName} {yearNumber}
          </h2>
        </div>

        {/* Right Action buttons (View Switcher Tabs & Add Event) */}
        <div className="flex flex-wrap items-center gap-3">
          <Tabs
            value={viewMode}
            onValueChange={(val) =>
              setViewMode(val as "auto" | "month" | "list")
            }
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
