import { useMemo } from "react";
import {
  AlertCircle,
  FileText,
  Search,
  Video,
  X,
} from "lucide-react";
import { useUserCommunities } from "@/features/users";
import { useStudyYearDetail } from "@/features/studyYears/api/getStudyYearDetail";
import type { EventType } from "../api/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  const selectedCategoryValue = selectedType || "ALL";

  return (
    <div className="space-y-3 pt-1">
      {/* Row 1: Dropdown Filters Group */}
      <div className="flex flex-wrap items-end gap-2.5">
        {/* Community Dropdown */}
        <div className="flex flex-col gap-1.5 w-full sm:w-44">
          <Label className="text-[11px] font-semibold text-muted-foreground">
            Community
          </Label>
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
              <SelectValue placeholder="All Communities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL_COMMUNITIES">
                All Communities ({communities.length})
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
        <div className="flex flex-col gap-1.5 w-full sm:w-32">
          <Label className="text-[11px] font-semibold text-muted-foreground">
            Study Year
          </Label>
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
        <div className="flex flex-col gap-1.5 w-full sm:w-44">
          <Label className="text-[11px] font-semibold text-muted-foreground">
            Course
          </Label>
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
                  !communitySlug ? "Select community" : "All Courses"
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

        {/* Event Type Filter Dropdown */}
        <div className="flex flex-col gap-1.5 w-full sm:w-40">
          <Label className="text-[11px] font-semibold text-muted-foreground">
            Event Type
          </Label>
          <Select
            value={selectedCategoryValue}
            onValueChange={(val: string | null) => {
              if (val) onTypeChange(val as EventType | "ALL");
            }}
          >
            <SelectTrigger className="w-full h-9 bg-background text-xs">
              <SelectValue placeholder="All Event Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">
                All Event Types ({totalCount})
              </SelectItem>
              <SelectItem value="EXAM">
                <span className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400 font-medium">
                  <AlertCircle className="size-3.5" /> Exams ({examCount})
                </span>
              </SelectItem>
              <SelectItem value="ASSIGNMENT">
                <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-medium">
                  <FileText className="size-3.5" /> Assignments ({assignmentCount})
                </span>
              </SelectItem>
              <SelectItem value="LECTURE">
                <span className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 font-medium">
                  <Video className="size-3.5" /> Lectures ({lectureCount})
                </span>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Row 2: Search Input (Dedicated Full-Width Line) */}
      <div className="relative w-full">
        <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground pointer-events-none" />
        <Input
          type="text"
          placeholder="Search events, courses, rooms..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-8 pr-8 h-9 text-xs w-full bg-background"
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
    </div>
  );
}
