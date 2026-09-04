import { useCallback } from "react";
import {
  FileText,
  Pen,
  Video,
  SlidersHorizontal,
  Users,
} from "@/components/ui/icons";
import { useUserCommunities } from "@/features/users";
import type { EventType } from "../api/types";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { SearchInput } from "@/components/app/SearchInput";
import { useCommunityStudyYears } from "@/features/communities";
import {
  StudyYearNameMap,
  useStudyYearCourses,
  type StudyYearNameDto,
} from "@/features/studyYears";
import { useUrlFilters, useDebouncedInput } from "@/hooks/useUrlFilters";
import { CALENDAR_FILTER_SCHEMA } from "../schemas/calendarFilterSchema";
import { cn } from "@/lib/utils";

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

  // Derive filter values directly from URL params
  const communitySlug = filters.community || null;
  const studyYear = (filters.studyYear as StudyYearNameDto) || null;
  const courseSlug = filters.course || null;
  const selectedType = filters.type;

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

  const activeSecondaryFilterCount =
    (studyYear ? 1 : 0) +
    (courseSlug ? 1 : 0) +
    (selectedType !== "All" ? 1 : 0);

  const hasAnyActiveFilters =
    Boolean(filters.q) ||
    Boolean(studyYear) ||
    Boolean(courseSlug) ||
    selectedType !== "All";

  const handleClearSecondaryFilters = () => {
    setFilters({
      studyYear: "",
      course: "",
      type: "All",
    });
  };

  const handleResetAll = () => {
    setSearchInput("");
    setFilters({
      q: "",
      studyYear: "",
      course: "",
      type: "All",
    });
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
      {/* Search Input */}
      <div className="flex-1 min-w-[180px] max-w-md">
        <SearchInput
          value={searchInput}
          onChange={setSearchInput}
          placeholder="Search events by title, course, or room..."
          totalCount={totalCount}
          resultLabel="events"
        />
      </div>

      {/* Dropdown Filters and Popover Controls */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Community Dropdown */}
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
          <SelectTrigger
            size="sm"
            className="rounded-xl bg-card text-xs min-w-[130px] max-w-[200px]"
          >
            <SelectValue placeholder="Select Community">
              <span className="flex items-center gap-1.5 truncate">
                <Users className="size-3.5 text-muted-foreground shrink-0" />
                <span className="truncate">
                  {selectedCommunityName ?? "Select Community"}
                </span>
              </span>
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

        {/* Dedicated Filters Popover */}
        <Popover>
          <PopoverTrigger
            className={cn(
              "inline-flex items-center gap-1.5 h-8 px-2.5 text-xs font-medium rounded-xl border transition-colors cursor-pointer shrink-0 select-none",
              activeSecondaryFilterCount > 0
                ? "border-primary/50 bg-primary/10 text-primary dark:bg-primary/20 hover:bg-primary/15"
                : "border-border bg-card text-foreground hover:bg-muted",
            )}
          >
            <SlidersHorizontal className="size-3.5 shrink-0" />
            <span>Filters</span>
            {activeSecondaryFilterCount > 0 && (
              <span className="size-4 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
                {activeSecondaryFilterCount}
              </span>
            )}
          </PopoverTrigger>
          <PopoverContent
            align="end"
            className="w-80 p-3.5 space-y-3.5 rounded-2xl shadow-lg border bg-card"
          >
            <div className="flex items-center justify-between border-b pb-2">
              <div className="flex items-center gap-1.5 font-semibold text-xs text-foreground">
                <SlidersHorizontal className="size-3.5 text-muted-foreground" />
                <span>Filter Events</span>
              </div>
              {activeSecondaryFilterCount > 0 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="xs"
                  onClick={handleClearSecondaryFilters}
                  className="text-[11px] text-muted-foreground hover:text-foreground h-6 px-1.5 rounded-md"
                >
                  Clear filters
                </Button>
              )}
            </div>

            {/* Study Year Dropdown */}
            <div className="space-y-1.5">
              <Label className="text-[11px] font-semibold text-muted-foreground">
                Study Year
              </Label>
              <Select
                value={studyYear ?? "All"}
                onValueChange={(val: string | null) => {
                  if (!val || val === "NO_YEARS") return;
                  const nextYear =
                    val === "All" ? "" : (val as StudyYearNameDto);
                  setFilters({
                    studyYear: nextYear,
                    course: "",
                  });
                }}
                disabled={!communitySlug}
              >
                <SelectTrigger
                  size="sm"
                  className="w-full bg-background text-xs rounded-xl"
                >
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
            <div className="space-y-1.5">
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
                <SelectTrigger
                  size="sm"
                  className="w-full bg-background text-xs rounded-xl"
                >
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
            <div className="space-y-1.5">
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
                <SelectTrigger
                  size="sm"
                  className="w-full bg-background text-xs rounded-xl"
                >
                  <SelectValue placeholder="All">
                    {selectedTypeLabel}
                  </SelectValue>
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
                      <Video className="size-3.5 shrink-0 text-blue-600 dark:text-blue-400" />
                      <span className="truncate">
                        Lectures ({lectureCount})
                      </span>
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </PopoverContent>
        </Popover>

        {/* Global Reset */}
        {hasAnyActiveFilters && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleResetAll}
            className="text-xs text-muted-foreground hover:text-foreground rounded-xl"
          >
            Reset
          </Button>
        )}
      </div>
    </div>
  );
}
