import { useState, useMemo, useCallback } from "react";
import { useSearchParams } from "react-router";
import { Calendar, GraduationCap, Plus, Users } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { ExpandableSearch } from "@/components/app/ExpandableSearch";
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
import { TeacherDetailDialog } from "./TeacherDetailDialog";
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
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedTeacherId = searchParams.get("teacherId");

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
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
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
    setIsSearchExpanded(false);
    resetFilters();
  };

  return (
    <div className="space-y-6">
      {/* Unified Toolbar: Expandable search on left, filters on right */}
      <ExpandableSearch
        value={searchInput}
        onChange={setSearchInput}
        placeholder="Search teachers by name..."
        totalCount={totalTeachers}
        resultLabel="teachers"
        isExpanded={isSearchExpanded}
        onExpandedChange={setIsSearchExpanded}
        breakpoint={540}
        desktopMaxWidth="max-w-md"
        triggerTitle="Search teachers"
      >
        <FilterSelect
          label="Year"
          placeholder="Select Year"
          value={filters.studyYear}
          onChange={(val) => setFilter("studyYear", val)}
          options={studyYearOptions}
          defaultValue="ALL"
          icon={GraduationCap}
          disabled={isStudyYearsLoading}
        />

        <FilterSelect
          label="Semester"
          placeholder="Select Semester"
          value={filters.semester}
          onChange={(val) => setFilter("semester", val)}
          options={SEMESTER_FILTER_OPTIONS}
          defaultValue="ALL"
          icon={Calendar}
        />

        {hasActiveFilters && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleClearFilters}
            className="text-xs text-muted-foreground hover:text-foreground rounded-xl shrink-0 cursor-pointer"
          >
            Reset
          </Button>
        )}
      </ExpandableSearch>

      {/* Dedicated Action Button Row */}
      {canAddTeacher && (
        <div className="flex justify-end">
          <Button size="sm" onClick={() => setCreateTeacherOpen(true)}>
            <Plus />
            <span>Add Teacher</span>
          </Button>
        </div>
      )}

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

      {/* Teacher Detail Dialog driven by URL param teacherId */}
      <TeacherDetailDialog
        teacherId={selectedTeacherId}
        communitySlug={communitySlug}
        open={Boolean(selectedTeacherId)}
        onOpenChange={(open) => {
          if (!open) {
            setSearchParams(
              (prev) => {
                const next = new URLSearchParams(prev);
                next.delete("teacherId");
                return next;
              },
              { replace: true },
            );
          }
        }}
        callerMembership={callerMembership}
      />
    </div>
  );
}
