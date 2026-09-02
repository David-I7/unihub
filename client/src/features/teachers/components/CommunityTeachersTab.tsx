import { useState, useMemo, useCallback } from "react";
import { Plus, Users } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/app/SearchInput";
import { FilterSelect } from "@/components/app/FilterSelect";
import { ErrorStateCard } from "@/components/app/ErrorStateCard";
import { useAuthStore } from "@/features/auth";
import { usePermissions } from "@/hooks/usePermissions";
import { useObserver } from "@/hooks/useObserver";
import { useCommunityStudyYears } from "@/features/communities";
import {
  formatStudyYearName,
  slugToStudyYearEnum,
} from "@/features/studyYears";
import {
  useUrlFilters,
  useDebouncedInput,
  type FilterSchema,
} from "@/hooks/useUrlFilters";
import { useInfiniteCommunityTeachers } from "../api/getCommunityTeachers";
import { TeacherCard } from "./TeacherCard";
import { TeacherCardSkeleton } from "./TeacherCardSkeleton";
import { CreateTeacherDialog } from "./CreateTeacherDialog";
import type { CallerMembership } from "../api/types";

const SEMESTER_FILTER_OPTIONS = [
  { value: "ALL", label: "All Semesters" },
  { value: "1", label: "Semester 1" },
  { value: "2", label: "Semester 2" },
];

interface CommunityTeachersFilters {
  search: string;
  studyYear: string;
  semester: string;
}

const TEACHERS_FILTER_SCHEMA: FilterSchema<CommunityTeachersFilters> = {
  search: { defaultValue: "", paramKey: "search" },
  studyYear: { defaultValue: "ALL", paramKey: "studyYear" },
  semester: {
    defaultValue: "ALL",
    allowedValues: ["ALL", "1", "2"] as const,
    paramKey: "semester",
  },
};

interface CommunityTeachersTabProps {
  communitySlug: string;
  callerMembership?: CallerMembership | null;
}

export function CommunityTeachersTab({
  communitySlug,
  callerMembership,
}: CommunityTeachersTabProps) {
  const { filters, setFilters, setFilter, resetFilters } = useUrlFilters(
    TEACHERS_FILTER_SCHEMA,
  );

  const handleCommitSearch = useCallback(
    (val: string) => setFilters({ search: val }),
    [setFilters],
  );
  const [searchInput, setSearchInput, debouncedSearch] = useDebouncedInput(
    filters.search,
    handleCommitSearch,
    350,
  );
  const [createTeacherOpen, setCreateTeacherOpen] = useState(false);

  const user = useAuthStore((state) => state.user);
  const { isMember, isOwner, communityRole, globalPermissions } =
    usePermissions(callerMembership);

  // Fetch active study years for this community
  const { data: communityStudyYears, isLoading: isStudyYearsLoading } =
    useCommunityStudyYears(communitySlug);

  const studyYearOptions = useMemo(() => {
    if (!communityStudyYears || communityStudyYears.length === 0) {
      return [{ value: "ALL", label: "All Years" }];
    }
    return [
      { value: "ALL", label: "All Years" },
      ...communityStudyYears.map((y) => ({
        value: slugToStudyYearEnum(y.studyYearName),
        label: formatStudyYearName(y.studyYearName),
      })),
    ];
  }, [communityStudyYears]);

  const canAddTeacher =
    Boolean(user) &&
    (isMember ||
      isOwner ||
      communityRole === "COMMUNITY_ADMIN" ||
      communityRole === "COMMUNITY_MEMBER" ||
      globalPermissions.includes("ADMIN") ||
      globalPermissions.includes("ROOT") ||
      user?.role === "ADMIN" ||
      user?.role === "ROOT");

  const studyYearParam =
    filters.studyYear !== "ALL" ? filters.studyYear : undefined;
  const semesterParam =
    filters.semester !== "ALL" ? parseInt(filters.semester, 10) : undefined;

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useInfiniteCommunityTeachers(communitySlug, {
    search: debouncedSearch,
    studyYear: studyYearParam,
    semester: semesterParam,
    size: 12,
  });

  const teachers = useMemo(() => {
    return data?.pages.flatMap((page) => page.content) ?? [];
  }, [data]);

  const totalTeachers = data?.pages[0]?.totalElements ?? teachers.length;

  const { ref: sentinelRef } = useObserver({
    onIntersect: () => {
      if (hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
    enabled: Boolean(hasNextPage),
  });

  const hasActiveFilters =
    Boolean(debouncedSearch) ||
    filters.studyYear !== "ALL" ||
    filters.semester !== "ALL";

  const handleClearFilters = () => {
    setSearchInput("");
    resetFilters();
  };

  return (
    <div className="space-y-6">
      {/* 2-tier Header Toolbar */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-row items-center justify-between gap-3">
          {/* Search Bar */}
          <div className="flex-1 max-w-md">
            <SearchInput
              value={searchInput}
              onChange={setSearchInput}
              placeholder="Search teachers by name..."
              totalCount={totalTeachers}
              resultLabel="teachers"
            />
          </div>

          {/* Add Teacher Button */}
          {canAddTeacher && (
            <Button
              onClick={() => setCreateTeacherOpen(true)}
              className="gap-1.5 font-semibold cursor-pointer shrink-0"
            >
              <Plus className="size-4" />
              <span>Add Teacher</span>
            </Button>
          )}
        </div>

        {/* Filter Strip */}
        <div className="flex flex-wrap items-center gap-2.5 pt-1">
          {/* Study Year Select */}
          <FilterSelect
            label="Year"
            value={filters.studyYear}
            onChange={(val) => setFilter("studyYear", val)}
            options={studyYearOptions}
            disabled={isStudyYearsLoading}
          />

          {/* Semester Select */}
          <FilterSelect
            label="Semester"
            value={filters.semester}
            onChange={(val) => setFilter("semester", val)}
            options={SEMESTER_FILTER_OPTIONS}
          />

          {/* Reset Filters Shortcut */}
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="xs"
              onClick={handleClearFilters}
              className="text-xs text-muted-foreground hover:text-foreground h-9 px-2.5 rounded-xl cursor-pointer"
            >
              Reset Filters
            </Button>
          )}
        </div>
      </div>

      {/* Main Teachers Grid & States */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {Array.from({ length: 6 }).map((_, idx) => (
            <TeacherCardSkeleton key={idx} />
          ))}
        </div>
      ) : isError ? (
        <ErrorStateCard
          message={
            error instanceof Error
              ? error.message
              : "Failed to load community teachers."
          }
          onRetry={() => refetch()}
        />
      ) : teachers.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card p-12 text-center space-y-3">
          <div className="size-12 rounded-2xl bg-muted/50 flex items-center justify-center text-muted-foreground">
            <Users className="size-6" />
          </div>
          <div className="space-y-1 max-w-md">
            <h3 className="font-heading text-base font-bold text-foreground">
              {hasActiveFilters
                ? "No Teachers Match Filters"
                : "No Teachers Added Yet"}
            </h3>
            <p className="text-xs text-muted-foreground">
              {hasActiveFilters
                ? "No instructors matched your current search and filter criteria. Try adjusting your query."
                : "This community has not registered any instructors or professors yet."}
            </p>
          </div>
          {hasActiveFilters && (
            <Button
              variant="outline"
              size="xs"
              onClick={handleClearFilters}
              className="mt-2 text-xs cursor-pointer"
            >
              Reset Filters
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {teachers.map((teacher) => (
              <TeacherCard
                key={teacher.id}
                teacher={teacher}
                communitySlug={communitySlug}
                callerMembership={callerMembership}
              />
            ))}
          </div>

          {/* Infinite Scroll Sentinel */}
          <div
            ref={sentinelRef}
            className="py-4 text-center text-xs text-muted-foreground"
          >
            {isFetchingNextPage && (
              <div className="flex items-center justify-center gap-2">
                <div className="size-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <span>Loading more teachers...</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Teacher Dialog */}
      <CreateTeacherDialog
        communitySlug={communitySlug}
        open={createTeacherOpen}
        onOpenChange={setCreateTeacherOpen}
      />
    </div>
  );
}
