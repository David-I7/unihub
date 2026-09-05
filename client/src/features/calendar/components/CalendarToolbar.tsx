import { useMemo, useRef } from "react";
import { ChevronLeft, ChevronRight, ChevronDown } from "@/components/ui/icons";
import { LayoutGrid, List } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
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

const MONTH_SHORT_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export function CalendarToolbar({
  examCount,
  assignmentCount,
  lectureCount,
  totalCount,
}: CalendarToolbarProps) {
  const { filters, setFilters } = useUrlFilters(CALENDAR_FILTER_SCHEMA);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentDate = useMemo(
    () => new Date(filters.year, filters.month - 1, 1),
    [filters.year, filters.month],
  );
  const viewMode = filters.view;

  const monthName = MONTH_NAMES[currentDate.getMonth()];
  const shortMonthName = MONTH_SHORT_NAMES[currentDate.getMonth()];
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
    <div
      ref={containerRef}
      className="@container rounded-2xl border bg-card p-3 sm:p-5 shadow-xs space-y-3 sm:space-y-4"
    >
      {/* Top Row: Date Navigation & Action Buttons */}
      <div className="flex items-center justify-between gap-2">
        {/* Navigation Controls + Month Title */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="flex items-center gap-0.5 sm:gap-1 rounded-xl border bg-muted/40 p-0.5 sm:p-1 shrink-0">
            <button
              type="button"
              onClick={handlePrevMonth}
              title="Previous Month"
              className="p-1 sm:p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-background transition-colors cursor-pointer"
            >
              <ChevronLeft className="size-3.5 sm:size-4" />
            </button>
            <button
              type="button"
              onClick={handleToday}
              className="px-2 sm:px-3 py-1 text-xs font-semibold rounded-lg text-foreground hover:bg-background transition-colors cursor-pointer"
            >
              Today
            </button>
            <button
              type="button"
              onClick={handleNextMonth}
              title="Next Month"
              className="p-1 sm:p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-background transition-colors cursor-pointer"
            >
              <ChevronRight className="size-3.5 sm:size-4" />
            </button>
          </div>

          <h2 className="font-heading truncate text-base sm:text-lg md:text-xl font-extrabold text-foreground tracking-tight">
            <span className="inline @[540px]:hidden">
              {shortMonthName} {yearNumber}
            </span>
            <span className="hidden @[540px]:inline">
              {monthName} {yearNumber}
            </span>
          </h2>
        </div>

        <div className="shrink-0">
          {/* Dropdown for narrow containers */}
          <div className="block @[540px]:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 rounded-xl px-2 sm:px-2.5 gap-1.5 text-xs font-medium cursor-pointer border-border/80"
                    title="Change calendar layout"
                  >
                    <span className="capitalize text-xs">
                      {viewMode === "auto"
                        ? "Auto"
                        : viewMode === "month"
                          ? "Month"
                          : "List"}
                    </span>
                    <ChevronDown className="size-3 text-muted-foreground" />
                  </Button>
                }
              />
              <DropdownMenuContent align="end" className="min-w-36">
                <DropdownMenuItem
                  onClick={() => handleViewModeChange("auto")}
                  className={cn(
                    "cursor-pointer gap-2",
                    viewMode === "auto" && "font-semibold bg-secondary",
                  )}
                >
                  <span>Auto</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleViewModeChange("month")}
                  className={cn(
                    "cursor-pointer gap-2",
                    viewMode === "month" && "font-semibold bg-secondary",
                  )}
                >
                  <LayoutGrid className="size-3.5" />
                  <span>Month grid</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleViewModeChange("list")}
                  className={cn(
                    "cursor-pointer gap-2",
                    viewMode === "list" && "font-semibold bg-secondary",
                  )}
                >
                  <List className="size-3.5" />
                  <span>Agenda list</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Tabs for wider containers */}
          <div className="hidden @[540px]:block">
            <Tabs
              value={viewMode}
              onValueChange={handleViewModeChange}
              className="w-auto"
            >
              <TabsList className="h-8 sm:h-9 p-1 bg-muted/60 rounded-xl gap-1">
                <TabsTrigger
                  value="auto"
                  className="h-6 sm:h-7 text-xs px-2.5"
                  title="Auto responsive mode"
                >
                  Auto
                </TabsTrigger>
                <TabsTrigger
                  value="month"
                  className="h-6 sm:h-7 px-2"
                  title="Month grid view"
                >
                  <LayoutGrid className="size-3.5" />
                </TabsTrigger>
                <TabsTrigger
                  value="list"
                  className="h-6 sm:h-7 px-2"
                  title="Agenda list view"
                >
                  <List className="size-3.5" />
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
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
