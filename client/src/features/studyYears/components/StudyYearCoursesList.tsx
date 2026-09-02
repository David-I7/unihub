import { useState, useMemo, useCallback } from "react";
import { BookOpen, Plus } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { SearchInput } from "@/components/app/SearchInput";
import { FilterSelect } from "@/components/app/FilterSelect";
import { ErrorStateCard } from "@/components/app/ErrorStateCard";
import { useObserver } from "@/hooks/useObserver";
import { usePermissions } from "@/hooks/usePermissions";
import {
  useUrlFilters,
  useDebouncedInput,
  type FilterSchema,
} from "@/hooks/useUrlFilters";
import { CourseCard, CreateCourseModal } from "@/features/courses";
import { useInfiniteStudyYearHome } from "../api/getStudyYearHome";

export type FilterOption = "all" | "sem-1" | "sem-2" | "archived";

const FILTER_OPTIONS = [
  { value: "all", label: "All Courses" },
  { value: "sem-1", label: "Semester 1" },
  { value: "sem-2", label: "Semester 2" },
  { value: "archived", label: "Archived" },
];

interface StudyYearCoursesFilters {
  search: string;
  filter: FilterOption;
}

const COURSES_FILTER_SCHEMA: FilterSchema<StudyYearCoursesFilters> = {
  search: { defaultValue: "", paramKey: "search" },
  filter: {
    defaultValue: "all",
    allowedValues: ["all", "sem-1", "sem-2", "archived"] as const,
    paramKey: "filter",
  },
};

interface StudyYearCoursesListProps {
  communitySlug: string;
  studyYearSlug: string;
}

export function StudyYearCoursesList({
  communitySlug,
  studyYearSlug,
}: StudyYearCoursesListProps) {
  const { filters, setFilters, setFilter } = useUrlFilters(
    COURSES_FILTER_SCHEMA,
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
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const { canCreateCourse } = usePermissions(communitySlug);

  const semesterParam = useMemo(() => {
    if (filters.filter === "sem-1") return 1;
    if (filters.filter === "sem-2") return 2;
    return undefined;
  }, [filters.filter]);

  const archivedParam = useMemo(() => {
    return filters.filter === "archived";
  }, [filters.filter]);

  const {
    data,
    isLoading,
    isError,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    refetch,
  } = useInfiniteStudyYearHome(communitySlug, studyYearSlug, {
    size: 12,
    search: debouncedSearch || undefined,
    semester: semesterParam,
    archived: archivedParam,
  });

  const allCourses = useMemo(() => {
    return data?.pages.flatMap((page) => page.courses.content) ?? [];
  }, [data]);

  const totalCourses =
    data?.pages[0]?.courses.totalElements ?? allCourses.length;

  const { ref: loadMoreRef } = useObserver<HTMLDivElement>({
    onIntersect: () => {
      if (hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
    enabled: Boolean(hasNextPage && !isFetchingNextPage),
    rootMargin: "250px",
  });

  return (
    <div className="space-y-6">
      {/* 2-tier Search and Filter Toolbar */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex-1 max-w-xl">
            <SearchInput
              value={searchInput}
              onChange={setSearchInput}
              placeholder="Search courses by name, abbreviation, or instructor..."
              totalCount={totalCourses}
              resultLabel="courses"
            />
          </div>
        </div>

        {/* Filter Strip */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1">
          <FilterSelect
            label="Filter"
            value={filters.filter}
            onChange={(val) => setFilter("filter", val as FilterOption)}
            options={FILTER_OPTIONS}
          />

          {canCreateCourse && (
            <Button
              size="sm"
              onClick={() => setCreateModalOpen(true)}
              className="gap-1.5 font-bold cursor-pointer"
            >
              <Plus className="size-4" />
              <span>Add Course</span>
            </Button>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, idx) => (
            <Card
              key={idx}
              className="p-5 space-y-4 rounded-2xl border bg-card animate-pulse"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="size-11 rounded-xl bg-muted" />
                <div className="h-5 w-20 bg-muted rounded-full" />
              </div>
              <div className="space-y-2">
                <div className="h-5 w-3/4 bg-muted rounded-md" />
                <div className="h-4 w-1/2 bg-muted rounded-md" />
              </div>
              <div className="pt-3 border-t border-border flex justify-between">
                <div className="h-4 w-16 bg-muted rounded-md" />
                <div className="h-4 w-20 bg-muted rounded-md" />
              </div>
            </Card>
          ))}
        </div>
      ) : isError ? (
        <ErrorStateCard
          message="Failed to load courses for this study year."
          onRetry={() => refetch()}
        />
      ) : allCourses.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card p-12 text-center space-y-4">
          <div className="flex size-12 items-center justify-center rounded-xl bg-muted text-muted-foreground">
            <BookOpen className="size-6" />
          </div>
          <div className="space-y-1">
            <h3 className="font-heading text-base font-semibold text-foreground">
              {debouncedSearch
                ? `No courses matching "${debouncedSearch}"`
                : "No Courses Found"}
            </h3>
            <p className="text-xs text-muted-foreground max-w-sm">
              {debouncedSearch
                ? "Try searching for a different keyword or clearing your filter."
                : filters.filter === "archived"
                  ? "There are currently no archived courses for this study year."
                  : "No courses are currently registered in this study year."}
            </p>
          </div>
          {debouncedSearch && (
            <button
              type="button"
              onClick={() => {
                setSearchInput("");
                setFilters({ search: "" });
              }}
              className="text-xs font-semibold text-primary hover:underline cursor-pointer"
            >
              Clear search query
            </button>
          )}
          {canCreateCourse && !debouncedSearch && (
            <Button
              size="sm"
              onClick={() => setCreateModalOpen(true)}
              className="gap-1.5 font-bold cursor-pointer mt-2"
            >
              <Plus className="size-4" />
              <span>Add First Course</span>
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {allCourses.map((item) => (
              <CourseCard
                key={item.course.id}
                item={item}
                communitySlug={communitySlug}
                studyYearSlug={studyYearSlug}
              />
            ))}
          </div>

          {/* Infinite Scroll Sentinel */}
          {hasNextPage && (
            <div
              ref={loadMoreRef}
              className="flex justify-center items-center py-6 min-h-[48px]"
            >
              {isFetchingNextPage && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                  <Spinner className="size-4" />
                  <span>Loading more courses...</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <CreateCourseModal
        communitySlug={communitySlug}
        studyYearSlug={studyYearSlug}
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
      />
    </div>
  );
}
