import { useCallback, useState, useMemo } from "react";
import {
  SlidersHorizontal,
  Users,
  GraduationCap,
  BookOpen,
} from "@/components/ui/icons";
import { useUserCommunities } from "@/features/users";
import type { EventType } from "../api/types";
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
import { ExpandableSearch } from "@/components/app/ExpandableSearch";
import { FilterSelect, type FilterOption } from "@/components/app/FilterSelect";
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
  const [isSearchExpanded, setIsSearchExpanded] = useState(Boolean(filters.q));

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

  const studyYearOptions: FilterOption[] = useMemo(() => {
    return [
      { value: "All", label: "All Years" },
      ...(communityStudyYears?.map((y) => ({
        value: StudyYearNameMap[y.studyYearName] as string,
        label: y.studyYearName,
      })) ?? []),
    ];
  }, [communityStudyYears]);

  const courseOptions: FilterOption[] = useMemo(() => {
    return [
      { value: "All", label: "All Courses" },
      ...(studyYearCourses?.map((c) => ({
        value: c.slug,
        label: c.name,
      })) ?? []),
    ];
  }, [studyYearCourses]);

  const typeOptions: FilterOption[] = useMemo(() => {
    return [
      { value: "All", label: `All (${totalCount})` },
      { value: "EXAM", label: `Exams (${examCount})` },
      { value: "ASSIGNMENT", label: `Assignments (${assignmentCount})` },
      { value: "LECTURE", label: `Lectures (${lectureCount})` },
    ];
  }, [totalCount, examCount, assignmentCount, lectureCount]);

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
    setIsSearchExpanded(false);
    setFilters({
      q: "",
      studyYear: "",
      course: "",
      type: "All",
    });
  };

  return (
    <ExpandableSearch
      value={searchInput}
      onChange={setSearchInput}
      placeholder="Search events by title, course, or room..."
      totalCount={totalCount}
      resultLabel="events"
      breakpoint={540}
      desktopMaxWidth="max-w-xs md:max-w-sm lg:max-w-md"
      isExpanded={isSearchExpanded}
      onExpandedChange={setIsSearchExpanded}
      triggerTitle="Search events"
    >
      {/* Community Dropdown */}
      <div className="w-[140px] sm:w-[180px] md:w-[220px] shrink-0">
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
            className="rounded-xl text-xs w-full cursor-pointer border-border/80"
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
      </div>

      {/* Dedicated Filters Popover */}
      <Popover>
        <PopoverTrigger
          render={
            <Button
              type="button"
              variant={activeSecondaryFilterCount > 0 ? "secondary" : "outline"}
              size="sm"
              className={cn(
                "h-8 rounded-xl px-2 sm:px-2.5 gap-1.5 text-xs font-medium cursor-pointer border-border/80 shrink-0",
                activeSecondaryFilterCount > 0 && "border-border",
              )}
            >
              <SlidersHorizontal className="size-3.5 shrink-0" />
              <span className="hidden @[540px]:inline">Filters</span>
              {activeSecondaryFilterCount > 0 && (
                <span className="size-4 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
                  {activeSecondaryFilterCount}
                </span>
              )}
            </Button>
          }
        />
        <PopoverContent
          align="end"
          className="w-64 sm:w-72 p-2.5 space-y-2 rounded-2xl shadow-lg border bg-card"
        >
          <div className="flex items-center justify-between border-b pb-1.5 border-border/60">
            <div className="flex items-center gap-1.5 font-semibold text-xs text-foreground">
              <SlidersHorizontal className="size-3.5 text-muted-foreground" />
              <span>Filters</span>
              {activeSecondaryFilterCount > 0 && (
                <span className="size-4 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
                  {activeSecondaryFilterCount}
                </span>
              )}
            </div>
            {activeSecondaryFilterCount > 0 && (
              <Button
                type="button"
                variant="ghost"
                size="xs"
                onClick={handleClearSecondaryFilters}
                className="text-[11px] text-muted-foreground hover:text-foreground h-5 px-1.5 rounded-md cursor-pointer"
              >
                Clear filters
              </Button>
            )}
          </div>

          <div className="space-y-1.5 pt-0.5">
            {/* Study Year */}
            <FilterSelect
              label="Year"
              placeholder="Select Year"
              value={studyYear ?? "All"}
              onChange={(val) => {
                const nextYear = val === "All" ? "" : (val as StudyYearNameDto);
                setFilters({
                  studyYear: nextYear,
                  course: "",
                });
              }}
              options={studyYearOptions}
              defaultValue="All"
              icon={GraduationCap}
              disabled={!communitySlug}
              className="w-full"
              triggerClassName="w-full max-w-none justify-between border-border/80"
            />

            {/* Course */}
            <FilterSelect
              label="Course"
              placeholder="Select Course"
              value={courseSlug ?? "All"}
              onChange={(val) => {
                const nextCourse = val === "All" ? "" : val;
                setFilters({ course: nextCourse });
              }}
              options={courseOptions}
              defaultValue="All"
              icon={BookOpen}
              disabled={!studyYear}
              className="w-full"
              triggerClassName="w-full max-w-none justify-between border-border/80"
            />

            {/* Event Type */}
            <FilterSelect
              label="Type"
              placeholder="Select Type"
              value={selectedType}
              onChange={(val) => {
                setFilters({
                  type: (val as EventType | "All") || "All",
                });
              }}
              options={typeOptions}
              defaultValue="All"
              icon={SlidersHorizontal}
              className="w-full"
              triggerClassName="w-full max-w-none justify-between border-border/80"
            />
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
          className="text-xs text-muted-foreground hover:text-foreground rounded-xl shrink-0"
        >
          Reset
        </Button>
      )}
    </ExpandableSearch>
  );
}
