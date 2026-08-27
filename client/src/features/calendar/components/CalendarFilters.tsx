import { AlertCircle, FileText, Search, Video, X } from "lucide-react";
import { useUserCommunities } from "@/features/users";
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
import { useCommunityStudyYears } from "@/features/communities";
import {
  StudyYearNameMap,
  useStudyYearCourses,
  type StudyYearName,
} from "@/features/studyYears";

interface CalendarFiltersProps {
  communitySlug: string | null;
  onCommunityChange: (slug: string | null) => void;
  studyYear: string | null;
  onStudyYearChange: (year: string | null) => void;
  courseSlug: string | null;
  onCourseChange: (courseSlug: string | null) => void;
  selectedType: EventType | "ALL_TYPES";
  onTypeChange: (type: EventType | "ALL_TYPES") => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  examCount: number;
  assignmentCount: number;
  lectureCount: number;
  totalCount: number;
}

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

  // Fetch all study years for the selected community
  const { data: communityStudyYears } = useCommunityStudyYears(
    communitySlug ?? "",
  );

  // Fetch all courses for the selected community and study year
  const { data: studyYearCourses } = useStudyYearCourses(
    communitySlug ?? "",
    studyYear ?? "",
  );

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
            value={communitySlug}
            onValueChange={(val: string | null) => {
              if (!val || val === "NO_COMMUNITIES") return;
              onCommunityChange(val);
              onCourseChange(null);
              onStudyYearChange(null);
            }}
          >
            <SelectTrigger className="w-full h-9 bg-background text-xs">
              <SelectValue placeholder="Select Community" />
            </SelectTrigger>
            <SelectContent>
              {userCommunitiesData?.communities.length === 0 && (
                <SelectItem value="NO_COMMUNITIES" disabled>
                  No communities found
                </SelectItem>
              )}
              {userCommunitiesData?.communities.map((c) => (
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
            value={studyYear}
            onValueChange={(val: string | null) => {
              if (!val || val === "NO_YEARS") return;
              const next = StudyYearNameMap[val as StudyYearName];
              onStudyYearChange(next);
              onCourseChange(null);
            }}
            disabled={!communitySlug}
          >
            <SelectTrigger className="w-full h-9 bg-background text-xs">
              <SelectValue placeholder="Select Year" />
            </SelectTrigger>
            <SelectContent>
              {communityStudyYears?.length === 0 && (
                <SelectItem value="NO_YEARS" disabled>
                  No study years found
                </SelectItem>
              )}
              {communityStudyYears?.map((y) => (
                <SelectItem key={y.id} value={y.studyYearName}>
                  {y.studyYearName}
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
            value={courseSlug ?? "ALL_COURSES"}
            onValueChange={(val: string | null) => {
              if (!val || val === "NO_COURSES") return;
              const next = val === "ALL_COURSES" ? null : val;
              onCourseChange(next);
            }}
            disabled={!studyYear}
          >
            <SelectTrigger className="w-full h-9 bg-background text-xs">
              <SelectValue placeholder="Select Course" />
            </SelectTrigger>
            <SelectContent>
              {studyYearCourses?.length === 0 && (
                <SelectItem value="NO_COURSES" disabled>
                  No courses found
                </SelectItem>
              )}
              <SelectItem value="ALL_COURSES">All Courses</SelectItem>
              {studyYearCourses?.map((c) => (
                <SelectItem key={c.id} value={c.slug}>
                  {c.name}
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
            value={selectedType}
            onValueChange={(val: string | null) => {
              if (val) onTypeChange(val as EventType | "ALL_TYPES");
            }}
          >
            <SelectTrigger className="w-full h-9 bg-background text-xs">
              <SelectValue placeholder="All Event Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL_TYPES">
                All Events ({totalCount})
              </SelectItem>
              <SelectItem value="EXAM">
                <span className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400 font-medium">
                  <AlertCircle className="size-3.5" /> Exams ({examCount})
                </span>
              </SelectItem>
              <SelectItem value="ASSIGNMENT">
                <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-medium">
                  <FileText className="size-3.5" /> Assignments (
                  {assignmentCount})
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
