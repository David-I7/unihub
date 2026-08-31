import { useState, useEffect, useMemo } from "react";
import { Search, X, Plus, GraduationCap, Users, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ErrorStateCard } from "@/components/app/ErrorStateCard";
import { useAuthStore } from "@/features/auth";
import { usePermissions } from "@/hooks/usePermissions";
import { useObserver } from "@/hooks/useObserver";
import { useCommunityStudyYears } from "@/features/communities";
import { formatStudyYearName, slugToStudyYearEnum } from "@/features/studyYears";
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

interface CommunityTeachersTabProps {
  communitySlug: string;
  callerMembership?: CallerMembership | null;
}

export function CommunityTeachersTab({
  communitySlug,
  callerMembership,
}: CommunityTeachersTabProps) {
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedStudyYear, setSelectedStudyYear] = useState<string>("ALL");
  const [selectedSemester, setSelectedSemester] = useState<string>("ALL");
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

  // 350ms debounce for search query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchInput.trim());
    }, 350);

    return () => clearTimeout(handler);
  }, [searchInput]);

  const studyYearParam = selectedStudyYear !== "ALL" ? selectedStudyYear : undefined;
  const semesterParam = selectedSemester !== "ALL" ? parseInt(selectedSemester, 10) : undefined;

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
    selectedStudyYear !== "ALL" ||
    selectedSemester !== "ALL";

  const handleClearFilters = () => {
    setSearchInput("");
    setDebouncedSearch("");
    setSelectedStudyYear("ALL");
    setSelectedSemester("ALL");
  };

  return (
    <div className="space-y-6">
      {/* Header Toolbar */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search Bar */}
          <div className="relative flex items-center flex-1 max-w-md">
            <Search className="absolute left-3.5 size-4 text-muted-foreground pointer-events-none" />
            <Input
              type="text"
              placeholder="Search teachers by first or last name..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-10 pr-10 h-10 text-xs sm:text-sm rounded-xl"
            />
            {searchInput && (
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                onClick={() => setSearchInput("")}
                className="absolute right-2.5 size-6 text-muted-foreground hover:text-foreground cursor-pointer"
                title="Clear search"
              >
                <X className="size-3.5" />
              </Button>
            )}
          </div>

          {/* Add Teacher Button */}
          {canAddTeacher && (
            <Button
              onClick={() => setCreateTeacherOpen(true)}
              className="gap-2 font-bold text-xs h-10 px-4 rounded-xl cursor-pointer shrink-0"
            >
              <Plus className="size-4" />
              <span>Add Teacher</span>
            </Button>
          )}
        </div>

        {/* Filter Dropdowns Row */}
        <div className="flex flex-wrap items-center gap-2.5 pt-1">
          <div className="flex items-center gap-1 text-xs text-muted-foreground mr-1">
            <Filter className="size-3.5" />
            <span className="font-semibold uppercase tracking-wider text-[11px]">
              Filters:
            </span>
          </div>

          {/* Study Year Select */}
          <div className="w-36">
            <Select
              value={selectedStudyYear}
              onValueChange={(val: string | null) => {
                if (val) setSelectedStudyYear(val);
              }}
              disabled={isStudyYearsLoading}
            >
              <SelectTrigger className="h-9 bg-card text-xs rounded-xl">
                <SelectValue placeholder="Study Year" />
              </SelectTrigger>
              <SelectContent>
                {studyYearOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Semester Select */}
          <div className="w-36">
            <Select
              value={selectedSemester}
              onValueChange={(val: string | null) => {
                if (val) setSelectedSemester(val);
              }}
            >
              <SelectTrigger className="h-9 bg-card text-xs rounded-xl">
                <SelectValue placeholder="Semester" />
              </SelectTrigger>
              <SelectContent>
                {SEMESTER_FILTER_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, idx) => (
            <TeacherCardSkeleton key={idx} />
          ))}
        </div>
      ) : isError ? (
        <ErrorStateCard
          message={error instanceof Error ? error.message : "Failed to load community teachers roster."}
          onRetry={() => refetch()}
        />
      ) : teachers.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card p-12 text-center space-y-3">
          <div className="size-12 rounded-2xl bg-muted/50 flex items-center justify-center text-muted-foreground">
            <GraduationCap className="size-6" />
          </div>
          <div className="space-y-1 max-w-md">
            <h3 className="font-heading text-base font-bold text-foreground">
              {hasActiveFilters ? "No Teachers Match Filters" : "No Teachers Registered Yet"}
            </h3>
            <p className="text-xs text-muted-foreground">
              {hasActiveFilters
                ? "No faculty members matched the current search and filter criteria. Try resetting your filters."
                : "This community currently does not have any teachers registered in its catalog."}
            </p>
          </div>
          {hasActiveFilters ? (
            <Button
              variant="outline"
              size="xs"
              onClick={handleClearFilters}
              className="mt-2 text-xs cursor-pointer"
            >
              Reset Filters
            </Button>
          ) : (
            canAddTeacher && (
              <Button
                size="xs"
                onClick={() => setCreateTeacherOpen(true)}
                className="mt-2 gap-1.5 text-xs font-semibold cursor-pointer"
              >
                <Plus className="size-3.5" />
                Add First Teacher
              </Button>
            )
          )}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
            <span className="flex items-center gap-1.5 font-medium">
              <Users className="size-3.5" />
              <span>
                Showing {teachers.length} of {totalTeachers} {totalTeachers === 1 ? "teacher" : "teachers"}
              </span>
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
          <div ref={sentinelRef} className="py-4 text-center text-xs text-muted-foreground">
            {isFetchingNextPage && (
              <div className="flex items-center justify-center gap-2">
                <div className="size-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <span>Loading more teachers...</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Create Teacher Modal */}
      <CreateTeacherDialog
        communitySlug={communitySlug}
        open={createTeacherOpen}
        onOpenChange={setCreateTeacherOpen}
      />
    </div>
  );
}
