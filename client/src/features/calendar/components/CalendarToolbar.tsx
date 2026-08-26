import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import type { EventType } from "../api/types";
import { CalendarFilters } from "./CalendarFilters";
import { Button } from "@/components/ui/button";

interface CalendarToolbarProps {
  currentDate: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onToday: () => void;
  onAddEvent: () => void;
  communitySlug?: string;
  onCommunityChange: (slug?: string) => void;
  studyYear?: string;
  onStudyYearChange: (year?: string) => void;
  courseSlug?: string;
  onCourseChange: (courseSlug?: string) => void;
  selectedType: EventType | "ALL";
  onTypeChange: (type: EventType | "ALL") => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
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
  currentDate,
  onPrevMonth,
  onNextMonth,
  onToday,
  onAddEvent,
  communitySlug,
  onCommunityChange,
  studyYear,
  onStudyYearChange,
  courseSlug,
  onCourseChange,
  selectedType,
  onTypeChange,
  searchQuery,
  onSearchChange,
  examCount,
  assignmentCount,
  lectureCount,
  totalCount,
}: CalendarToolbarProps) {
  const monthName = MONTH_NAMES[currentDate.getMonth()];
  const yearNumber = currentDate.getFullYear();

  return (
    <div className="rounded-2xl border bg-card p-4 shadow-xs space-y-4">
      {/* Top Row: Date Navigation & Primary Add Event Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Navigation Controls + Month Title */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 rounded-xl border bg-muted/40 p-1">
            <button
              type="button"
              onClick={onPrevMonth}
              title="Previous Month"
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-background transition-colors cursor-pointer"
            >
              <ChevronLeft className="size-4" />
            </button>
            <button
              type="button"
              onClick={onToday}
              className="px-3 py-1 text-xs font-semibold rounded-lg text-foreground hover:bg-background transition-colors cursor-pointer"
            >
              Today
            </button>
            <button
              type="button"
              onClick={onNextMonth}
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

        {/* Add Event Button */}
        <Button
          size="sm"
          onClick={onAddEvent}
          className="gap-1.5 font-semibold text-xs h-9 cursor-pointer"
        >
          <Plus className="size-4" />
          Add Event
        </Button>
      </div>

      {/* Filter Selectors and Search/Category Chips */}
      <CalendarFilters
        communitySlug={communitySlug}
        onCommunityChange={onCommunityChange}
        studyYear={studyYear}
        onStudyYearChange={onStudyYearChange}
        courseSlug={courseSlug}
        onCourseChange={onCourseChange}
        selectedType={selectedType}
        onTypeChange={onTypeChange}
        searchQuery={searchQuery}
        onSearchChange={onSearchChange}
        examCount={examCount}
        assignmentCount={assignmentCount}
        lectureCount={lectureCount}
        totalCount={totalCount}
      />
    </div>
  );
}
