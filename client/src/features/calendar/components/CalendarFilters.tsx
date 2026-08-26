import { useMemo } from "react";
import {
  AlertCircle,
  FileText,
  Filter,
  Search,
  Video,
  X,
} from "lucide-react";
import { useUserCommunities } from "@/features/users";
import { useStudyYearDetail } from "@/features/studyYears/api/getStudyYearDetail";
import type { EventType } from "../api/types";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface CalendarFiltersProps {
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

const STUDY_YEARS = [
  { label: "All Years", value: "ALL_YEARS" },
  { label: "Year 1", value: "year-1" },
  { label: "Year 2", value: "year-2" },
  { label: "Year 3", value: "year-3" },
  { label: "Year 4", value: "year-4" },
];

export function CalendarFilters({
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
}: CalendarFiltersProps) {
  // Fetch user enrolled communities list
  const { data: userCommunitiesData } = useUserCommunities();
  const communities = userCommunitiesData?.communities ?? [];

  // Fetch courses for the selected study year if community and studyYear are selected
  const activeStudyYear =
    studyYear && studyYear !== "ALL_YEARS" ? studyYear : "year-1";
  const { data: studyYearDetail } = useStudyYearDetail(
    communitySlug ?? "",
    activeStudyYear,
    { includeArchived: false },
  );

  // Available courses
  const courses = useMemo(() => {
    if (!communitySlug) return [];
    return studyYearDetail?.courses ?? [];
  }, [communitySlug, studyYearDetail]);

  const selectedCommunityValue = communitySlug || "ALL_COMMUNITIES";
  const selectedYearValue = studyYear || "ALL_YEARS";
  const selectedCourseValue = courseSlug || "ALL_COURSES";

  return (
    <div className="space-y-3">
      {/* Row 1 Selectors (Community, Year, Course) */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Community Dropdown */}
        <div className="w-full sm:w-48">
          <Select
            value={selectedCommunityValue}
            onValueChange={(val: string | null) => {
              const next =
                !val || val === "ALL_COMMUNITIES" ? undefined : val;
              onCommunityChange(next);
              onCourseChange(undefined);
            }}
          >
            <SelectTrigger className="w-full h-9 bg-background text-xs">
              <SelectValue placeholder="All Enrolled Communities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL_COMMUNITIES">
                All Enrolled ({communities.length})
              </SelectItem>
              {communities.map((c) => (
                <SelectItem key={c.id} value={c.slug}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Study Year Dropdown */}
        <div className="w-full sm:w-36">
          <Select
            value={selectedYearValue}
            onValueChange={(val: string | null) => {
              const next = !val || val === "ALL_YEARS" ? undefined : val;
              onStudyYearChange(next);
              onCourseChange(undefined);
            }}
          >
            <SelectTrigger className="w-full h-9 bg-background text-xs">
              <SelectValue placeholder="All Years" />
            </SelectTrigger>
            <SelectContent>
              {STUDY_YEARS.map((y) => (
                <SelectItem key={y.value} value={y.value}>
                  {y.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Course Dropdown */}
        <div className="w-full sm:w-44">
          <Select
            value={selectedCourseValue}
            onValueChange={(val: string | null) => {
              const next = !val || val === "ALL_COURSES" ? undefined : val;
              onCourseChange(next);
            }}
            disabled={!communitySlug}
          >
            <SelectTrigger className="w-full h-9 bg-background text-xs">
              <SelectValue
                placeholder={
                  !communitySlug ? "Select community first" : "All Courses"
                }
              />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL_COURSES">All Courses</SelectItem>
              {courses.map((item) => (
                <SelectItem key={item.course.id} value={item.course.slug}>
                  {item.course.abbreviation
                    ? `[${item.course.abbreviation}] ${item.course.name}`
                    : item.course.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Row 2: Search input & Category Filter Chips */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-t pt-3">
        {/* Search Input */}
        <div className="relative w-full md:w-64">
          <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground pointer-events-none" />
          <Input
            type="text"
            placeholder="Search events, courses, rooms..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-8 pr-8 h-9 text-xs"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>

        {/* Category Filter Chips */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-muted-foreground font-medium text-[11px] mr-1 flex items-center gap-1">
            <Filter className="size-3" /> Category:
          </span>

          <button
            type="button"
            onClick={() => onTypeChange("ALL")}
            className={cn(
              "rounded-lg px-3 py-1 text-xs font-semibold transition-all cursor-pointer",
              selectedType === "ALL"
                ? "bg-primary text-primary-foreground shadow-2xs"
                : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            All ({totalCount})
          </button>

          <button
            type="button"
            onClick={() => onTypeChange("EXAM")}
            className={cn(
              "flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-semibold transition-all cursor-pointer",
              selectedType === "EXAM"
                ? "bg-rose-600 text-white shadow-2xs"
                : "bg-rose-500/10 text-rose-700 dark:text-rose-300 hover:bg-rose-500/20",
            )}
          >
            <AlertCircle className="size-3" /> Exams ({examCount})
          </button>

          <button
            type="button"
            onClick={() => onTypeChange("ASSIGNMENT")}
            className={cn(
              "flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-semibold transition-all cursor-pointer",
              selectedType === "ASSIGNMENT"
                ? "bg-amber-600 text-white shadow-2xs"
                : "bg-amber-500/10 text-amber-700 dark:text-amber-300 hover:bg-amber-500/20",
            )}
          >
            <FileText className="size-3" /> Assignments ({assignmentCount})
          </button>

          <button
            type="button"
            onClick={() => onTypeChange("LECTURE")}
            className={cn(
              "flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-semibold transition-all cursor-pointer",
              selectedType === "LECTURE"
                ? "bg-blue-600 text-white shadow-2xs"
                : "bg-blue-500/10 text-blue-700 dark:text-blue-300 hover:bg-blue-500/20",
            )}
          >
            <Video className="size-3" /> Lectures ({lectureCount})
          </button>
        </div>
      </div>
    </div>
  );
}
