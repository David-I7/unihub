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
  // Pull state directly from useCalendarStore
  const communitySlug = useCalendarStore((s) => s.communitySlug);
  const studyYear = useCalendarStore((s) => s.studyYear);
  const courseSlug = useCalendarStore((s) => s.courseSlug);
  const selectedType = useCalendarStore((s) => s.selectedType);
  const searchQuery = useCalendarStore((s) => s.searchQuery);

  const setCommunitySlug = useCalendarStore((s) => s.setCommunitySlug);
  const setStudyYear = useCalendarStore((s) => s.setStudyYear);
  const setCourseSlug = useCalendarStore((s) => s.setCourseSlug);
  const setSelectedType = useCalendarStore((s) => s.setSelectedType);
  const setSearchQuery = useCalendarStore((s) => s.setSearchQuery);

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
            value={communitySlug ?? null}
            onValueChange={(val: string | null) => {
              if (!val || val === "NO_COMMUNITIES") return;
              setCommunitySlug(val);
            }}
          >
            <SelectTrigger className="w-full h-9 bg-background text-xs rounded-xl">
              <SelectValue placeholder="Select Community" />
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
              if (val === "All") {
                setStudyYear(null);
                return;
              }
              setStudyYear(val as StudyYearNameDto);
            }}
            disabled={!communitySlug}
          >
            <SelectTrigger className="w-full h-9 bg-background text-xs rounded-xl">
              <SelectValue placeholder="All" />
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
              const next = val === "All" ? null : val;
              setCourseSlug(next);
            }}
            disabled={!studyYear}
          >
            <SelectTrigger className="w-full h-9 bg-background text-xs rounded-xl">
              <SelectValue placeholder="Select Course" />
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
        <div className="flex flex-col gap-1.5 w-full sm:w-40">
          <Label className="text-[11px] font-semibold text-muted-foreground">
            Event Type
          </Label>
          <Select
            value={selectedType}
            onValueChange={(val: string | null) => {
              if (val) setSelectedType(val as EventType | "All");
            }}
          >
            <SelectTrigger className="w-full h-9 bg-background text-xs rounded-xl">
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All ({totalCount})</SelectItem>
              <SelectItem value="EXAM">
                <span className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400 font-medium">
                  <Pen className="size-3.5" /> Exams ({examCount})
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

      {/* Row 2: Standard Search Input */}
      <div className="w-full pt-1">
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search events by title, course, or room..."
          totalCount={totalCount}
          resultLabel="events"
        />
      </div>
    </div>
  );
}
