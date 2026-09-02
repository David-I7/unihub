import { useCallback } from "react";
import { FileText, Pen, Video } from "@/components/ui/icons";
import { useUserCommunities } from "@/features/users";
import { useCalendarStore } from "../store/useCalendarStore";
import type { EventType } from "../api/types";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SearchInput } from "@/components/app/SearchInput";
import { useCommunityStudyYears } from "@/features/communities";
import {
  StudyYearNameMap,
  useStudyYearCourses,
  type StudyYearNameDto,
} from "@/features/studyYears";
import { useUrlFilters, useDebouncedInput } from "@/hooks/useUrlFilters";
import { CALENDAR_FILTER_SCHEMA } from "../schemas/calendarFilterSchema";

interface CalendarFiltersProps {
  examCount: number;
  assignmentCount: number;
  lectureCount: number;
  totalCount: number;
}

export function CalendarFilters({
  examCount,
  assignmentCount,
  lectureCount,
  totalCount,
}: CalendarFiltersProps) {
  const { filters, setFilters } = useUrlFilters(CALENDAR_FILTER_SCHEMA);

  // Pull store state for display and queries
  const communitySlug = useCalendarStore((s) => s.communitySlug);
  const studyYear = useCalendarStore((s) => s.studyYear);
  const courseSlug = useCalendarStore((s) => s.courseSlug);
  const selectedType = useCalendarStore((s) => s.selectedType);

  const handleCommitSearch = useCallback(
    (val: string) => setFilters({ q: val }),
    [setFilters],
  );
  const [searchInput, setSearchInput] = useDebouncedInput(
    filters.q,
    handleCommitSearch,
    300,
  );

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

  const selectedCommunityName = userCommunitiesData?.content?.find(
    (c) => c.slug === communitySlug,
  )?.name;

  const selectedStudyYearName = studyYear
    ? (communityStudyYears?.find(
        (y) => StudyYearNameMap[y.studyYearName] === studyYear,
      )?.studyYearName ?? "All")
    : "All";

  const selectedCourseName = courseSlug
    ? (studyYearCourses?.find((c) => c.slug === courseSlug)?.name ?? "All")
    : "All";

  const selectedTypeLabel =
    selectedType === "All"
      ? "All"
      : selectedType === "EXAM"
        ? "Exams"
        : selectedType === "ASSIGNMENT"
          ? "Assignments"
          : selectedType === "LECTURE"
            ? "Lectures"
            : selectedType;

  return (
    <div className="space-y-3 pt-1">
      {/* Row 1: Standard Search Input */}
      <div className="w-full pt-1">
        <SearchInput
          value={searchInput}
          onChange={setSearchInput}
          placeholder="Search events by title, course, or room..."
          totalCount={totalCount}
          resultLabel="events"
        />
      </div>

      {/* Row 2: Dropdown Filters Group */}
      <div className="flex flex-wrap items-end gap-2.5">
        {/* Community Dropdown */}
        <div className="flex flex-col gap-1.5 w-full sm:w-44">
          <Label className="text-[11px] font-semibold text-muted-foreground">
            Community
          </Label>
          <Select
            value={communitySlug ?? null}
            onValueChange={(val: string | null) => {
              if (!val || val === "NO_COMMUNITIES") return;
              setFilters({
                community: val,
                studyYear: "",
                course: "",
              });
            }}
          >
            <SelectTrigger className="w-full h-9 bg-background text-xs rounded-xl">
              <SelectValue placeholder="Select Community">
                {selectedCommunityName}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {userCommunitiesData?.content?.length === 0 && (
                <SelectItem value="NO_COMMUNITIES" disabled>
                  No communities found
                </SelectItem>
              )}
              {userCommunitiesData?.content?.map((c) => (
                <SelectItem key={c.id} value={c.slug}>
                  <span className="truncate">{c.name}</span>
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
            value={studyYear ?? "All"}
            onValueChange={(val: string | null) => {
              if (!val || val === "NO_YEARS") return;
              const nextYear = val === "All" ? "" : (val as StudyYearNameDto);
              setFilters({
                studyYear: nextYear,
                course: "",
              });
            }}
            disabled={!communitySlug}
          >
            <SelectTrigger className="w-full h-9 bg-background text-xs rounded-xl">
              <SelectValue placeholder="All">
                {selectedStudyYearName}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {communityStudyYears?.length === 0 ? (
                <SelectItem value="NO_YEARS" disabled>
                  No study years found
                </SelectItem>
              ) : (
                <>
                  <SelectItem value="All">All</SelectItem>
                  {communityStudyYears?.map((y) => {
                    const mappedValue = StudyYearNameMap[y.studyYearName];
                    return (
                      <SelectItem key={y.id} value={mappedValue}>
                        <span className="truncate">{y.studyYearName}</span>
                      </SelectItem>
                    );
                  })}
                </>
              )}
            </SelectContent>
          </Select>
        </div>

        {/* Course Dropdown */}
        <div className="flex flex-col gap-1.5 w-full sm:w-44">
          <Label className="text-[11px] font-semibold text-muted-foreground">
            Course
          </Label>
          <Select
            value={courseSlug ?? "All"}
            onValueChange={(val: string | null) => {
              if (!val || val === "NO_COURSES") return;
              const nextCourse = val === "All" ? "" : val;
              setFilters({ course: nextCourse });
            }}
            disabled={!studyYear}
          >
            <SelectTrigger className="w-full h-9 bg-background text-xs rounded-xl">
              <SelectValue placeholder="Select Course">
                {selectedCourseName}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {studyYearCourses?.length === 0 && (
                <SelectItem value="NO_COURSES" disabled>
                  No courses found
                </SelectItem>
              )}
              <SelectItem value="All">All</SelectItem>
              {studyYearCourses?.map((c) => (
                <SelectItem key={c.id} value={c.slug}>
                  <span className="truncate">{c.name}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Event Type Filter Dropdown */}
        <div className="flex flex-col gap-1.5 w-full sm:w-44">
          <Label className="text-[11px] font-semibold text-muted-foreground">
            Event Type
          </Label>
          <Select
            value={selectedType}
            onValueChange={(val: string | null) => {
              if (val) {
                setFilters({ type: (val as EventType | "All") || "All" });
              }
            }}
          >
            <SelectTrigger className="w-full h-9 bg-background text-xs rounded-xl">
              <SelectValue placeholder="All">{selectedTypeLabel}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">
                <span className="truncate">All ({totalCount})</span>
              </SelectItem>
              <SelectItem value="EXAM">
                <span className="flex items-center gap-1.5 min-w-0">
                  <Pen className="size-3.5 shrink-0 text-purple-600 dark:text-purple-400" />
                  <span className="truncate">Exams ({examCount})</span>
                </span>
              </SelectItem>
              <SelectItem value="ASSIGNMENT">
                <span className="flex items-center gap-1.5 min-w-0">
                  <FileText className="size-3.5 shrink-0 text-amber-600 dark:text-amber-400" />
                  <span className="truncate">
                    Assignments ({assignmentCount})
                  </span>
                </span>
              </SelectItem>
              <SelectItem value="LECTURE">
                <span className="flex items-center gap-1.5 min-w-0">
                  <Video className="size-3.5 shrink-0 text-blue-600 dark:text-blue-400 " />
                  <span className="truncate">Lectures ({lectureCount})</span>
                </span>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
