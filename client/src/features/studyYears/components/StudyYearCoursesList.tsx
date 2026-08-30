import { useState, useMemo, useCallback } from "react";
import { Link } from "react-router";
import { Search, BookOpen, Star, Archive, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ErrorStateCard } from "@/components/app/ErrorStateCard";
import { debounce } from "@/lib/performanceUtils";
import { useObserver } from "@/hooks/useObserver";
import { useInfiniteStudyYearHome } from "../api/getStudyYearHome";

export type FilterOption = "all" | "sem-1" | "sem-2" | "archived";

const FILTER_OPTION_LABELS: Record<FilterOption, string> = {
  all: "All Courses",
  "sem-1": "Semester 1",
  "sem-2": "Semester 2",
  archived: "Archived",
};

interface StudyYearCoursesListProps {
  communitySlug: string;
  studyYearSlug: string;
}

export function StudyYearCoursesList({
  communitySlug,
  studyYearSlug,
}: StudyYearCoursesListProps) {
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filterOption, setFilterOption] = useState<FilterOption>("all");

  const debouncedUpdate = useMemo(
    () =>
      debounce((value: string) => {
        setDebouncedSearch(value.trim());
      }, 350),
    [],
  );

  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchInput(value);
      debouncedUpdate(value);
    },
    [debouncedUpdate],
  );

  const semesterParam = useMemo(() => {
    if (filterOption === "sem-1") return 1;
    if (filterOption === "sem-2") return 2;
    return undefined;
  }, [filterOption]);

  const archivedParam = useMemo(() => {
    return filterOption === "archived";
  }, [filterOption]);

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
      {/* Search and Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Search input on the left */}
        <div className="relative flex-1 max-w-xl">
          <Search className="absolute left-3.5 top-3 size-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search courses by name, abbreviation, or instructor..."
            value={searchInput}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10 pr-10 text-xs rounded-xl h-10 bg-card w-full shadow-2xs"
          />
          {searchInput && (
            <button
              type="button"
              onClick={() => handleSearchChange("")}
              className="absolute right-3 top-3 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <X className="size-4" />
            </button>
          )}
        </div>

        {/* Single-select Filter Dropdown on the right */}
        <div className="flex items-center gap-2.5">
          <Select
            value={filterOption}
            onValueChange={(val) => {
              if (val) setFilterOption(val as FilterOption);
            }}
          >
            <SelectTrigger className="h-10 w-[160px] text-xs font-normal rounded-xl bg-card shadow-2xs">
              <SelectValue placeholder="Filter courses">
                {FILTER_OPTION_LABELS[filterOption] ?? "All Courses"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Courses</SelectItem>
              <SelectItem value="sem-1">Semester 1</SelectItem>
              <SelectItem value="sem-2">Semester 2</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Courses Grid or Error / Loading / Empty state */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-44 rounded-2xl border bg-card/60 p-6 animate-pulse"
            />
          ))}
        </div>
      ) : isError ? (
        <ErrorStateCard
          message="Failed to load courses for this study year."
          onRetry={() => refetch()}
        />
      ) : allCourses.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card p-12 text-center space-y-3">
          <div className="flex size-12 items-center justify-center rounded-xl bg-muted text-muted-foreground">
            {filterOption === "archived" ? (
              <Archive className="size-6 text-amber-500" />
            ) : (
              <BookOpen className="size-6" />
            )}
          </div>
          <div className="space-y-1">
            <h3 className="font-heading text-base font-semibold text-foreground">
              {filterOption === "archived"
                ? "No Archived Courses"
                : "No Courses Found"}
            </h3>
            <p className="text-xs text-muted-foreground max-w-sm">
              {debouncedSearch
                ? `No courses matching "${debouncedSearch}" in this view.`
                : filterOption === "archived"
                  ? "There are no archived courses for this study year."
                  : filterOption === "sem-1"
                    ? "There are no active courses listed for Semester 1."
                    : filterOption === "sem-2"
                      ? "There are no active courses listed for Semester 2."
                      : "There are no active courses listed for this study year."}
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {allCourses.map(({ course, teachers }) => {
              const primaryTeacher = teachers?.[0];
              const courseUrl = `/communities/${communitySlug}/study-years/${studyYearSlug}/courses/${course.slug}`;

              return (
                <Link
                  key={course.id}
                  to={courseUrl}
                  className="group block no-underline"
                >
                  <Card className="h-full relative flex flex-col justify-between overflow-hidden rounded-2xl border bg-card p-6 shadow-xs hover:shadow-md hover:border-primary/60 transition-all space-y-4 cursor-pointer">
                    <div className="space-y-3">
                      {/* Header Badges */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="rounded-lg bg-primary/10 px-2.5 py-1 font-mono text-xs font-bold text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                            {course.abbreviation}
                          </span>
                          <Badge
                            variant="outline"
                            className="text-[11px] font-medium"
                          >
                            Semester {course.semester}
                          </Badge>
                        </div>

                        <div className="flex items-center gap-2">
                          {course.archived && (
                            <Badge
                              variant="secondary"
                              className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-[10px] font-bold gap-1"
                            >
                              <Archive className="size-3" />
                              Archived
                            </Badge>
                          )}
                          <span className="text-xs font-semibold text-muted-foreground">
                            {course.creditPoints} ECTS
                          </span>
                        </div>
                      </div>

                      {/* Course Title */}
                      <h3 className="font-heading text-lg font-bold text-foreground group-hover:text-primary transition-colors leading-snug">
                        {course.name}
                      </h3>

                      {/* Course Description */}
                      {course.description ? (
                        <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                          {course.description}
                        </p>
                      ) : (
                        <p className="text-xs text-muted-foreground/60 italic">
                          Standard curriculum course syllabus and materials.
                        </p>
                      )}
                    </div>

                    {/* Footer with Instructor */}
                    <div className="pt-4 border-t flex items-center justify-between text-xs">
                      {primaryTeacher ? (
                        <div className="flex items-center gap-2 min-w-0 pr-2">
                          <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary text-[10px] font-bold">
                            {primaryTeacher.lastName.slice(0, 2).toUpperCase()}
                          </div>
                          <span className="font-medium text-foreground truncate">
                            Prof. {primaryTeacher.lastName}
                          </span>
                          <span className="flex items-center gap-0.5 text-amber-500 font-bold shrink-0">
                            <Star className="size-3 fill-amber-500 text-amber-500" />
                            {primaryTeacher.averageRating?.toFixed(1) ?? "5.0"}
                          </span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground italic text-[11px]">
                          Instructor TBD
                        </span>
                      )}
                    </div>
                  </Card>
                </Link>
              );
            })}
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
    </div>
  );
}

