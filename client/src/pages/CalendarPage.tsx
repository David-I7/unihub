import { useMemo, useEffect } from "react";
import { Link, useSearchParams } from "react-router";
import {
  Calendar as CalendarIcon,
  Compass,
  Plus,
  Users,
} from "@/components/ui/icons";
import {
  CalendarAgendaList,
  CalendarMonthGrid,
  CalendarToolbar,
  DayOverflowModal,
  EventDetailModal,
  EventFormModal,
  useCalendarEvents,
  useCalendarStore,
} from "@/features/calendar";
import { useUserCommunities } from "@/features/users";
import { Button, buttonVariants } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import { usePermissions } from "@/hooks/usePermissions";

export default function CalendarPage() {
  const [searchParams] = useSearchParams();
  const openEventDetails = useCalendarStore((s) => s.openEventDetails);
  const openCreateModal = useCalendarStore((s) => s.openCreateModal);

  const currentDate = useCalendarStore((s) => s.currentDate);
  const communitySlug = useCalendarStore((s) => s.communitySlug);
  const studyYear = useCalendarStore((s) => s.studyYear);
  const courseSlug = useCalendarStore((s) => s.courseSlug);
  const selectedType = useCalendarStore((s) => s.selectedType);
  const searchQuery = useCalendarStore((s) => s.searchQuery);
  const viewMode = useCalendarStore((s) => s.viewMode);

  const { canCreateEvent } = usePermissions(communitySlug);

  const eventIdParam = searchParams.get("eventId");

  useEffect(() => {
    if (eventIdParam) {
      openEventDetails(eventIdParam);
    }
  }, [eventIdParam, openEventDetails]);

  // Fetch enrolled communities for empty-state evaluation and Add Event button permission
  const { data: userCommunitiesData, isLoading: isLoadingCommunities } =
    useUserCommunities();
  const userCommunities = userCommunitiesData?.content ?? [];
  const hasCommunities = userCommunities.length > 0;

  // Server-authoritative query: executes only when communitySlug is selected
  const {
    data: rawEvents,
    isLoading: isLoadingEvents,
    isFetching,
  } = useCalendarEvents(
    {
      year: currentDate.getFullYear(),
      month: currentDate.getMonth() + 1,
      communitySlug: communitySlug || undefined,
      studyYearName: studyYear || undefined,
      courseSlug: courseSlug || undefined,
    },
    {
      enabled: Boolean(communitySlug),
    },
  );

  const eventsList = useMemo(() => {
    return rawEvents ?? [];
  }, [rawEvents]);

  // Client-side filtering only for eventType and search keywords
  const filteredEvents = useMemo(() => {
    return eventsList.filter((ev) => {
      // 1. Event Type filter (Exams, Assignments, Lectures)
      if (selectedType !== "All") {
        if (ev.type !== selectedType) {
          return false;
        }
      }

      // 2. Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchTitle = ev.title.toLowerCase().includes(q);
        const matchCourseName = ev.courseName.toLowerCase().includes(q);
        const matchCourseSlug = ev.courseSlug.toLowerCase().includes(q);
        const matchAbbr = ev.courseAbbreviation?.toLowerCase().includes(q);
        const matchComm = ev.communityName?.toLowerCase().includes(q);
        if (
          !matchTitle &&
          !matchCourseName &&
          !matchCourseSlug &&
          !matchAbbr &&
          !matchComm
        ) {
          return false;
        }
      }

      return true;
    });
  }, [eventsList, selectedType, searchQuery]);

  // Category counts calculated from current server-scoped events
  const examCount = useMemo(
    () => eventsList.filter((e) => e.type === "EXAM").length,
    [eventsList],
  );
  const assignmentCount = useMemo(
    () => eventsList.filter((e) => e.type === "ASSIGNMENT").length,
    [eventsList],
  );
  const lectureCount = useMemo(
    () => eventsList.filter((e) => e.type === "LECTURE").length,
    [eventsList],
  );

  return (
    <div className="min-h-full space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl md:text-3xl font-bold tracking-tight text-foreground">
          Calendar
        </h1>
        {isFetching && !isLoadingEvents && (
          <div className="inline-flex items-center gap-2 text-xs text-muted-foreground">
            <Spinner className="size-3.5" />
            <span>Updating...</span>
          </div>
        )}
      </div>

      {/* Control Toolbar */}
      <CalendarToolbar
        examCount={examCount}
        assignmentCount={assignmentCount}
        lectureCount={lectureCount}
        totalCount={eventsList.length}
      />

      {/* Calendar View Container */}
      {!communitySlug ? (
        !hasCommunities && !isLoadingCommunities ? (
          /* Empty State 1: User has no enrolled communities */
          <div className="flex min-h-[360px] flex-col items-center justify-center rounded-2xl border bg-card p-12 text-center shadow-xs">
            <div className="size-12 rounded-2xl bg-muted/60 flex items-center justify-center text-muted-foreground mb-4">
              <Users className="size-6" />
            </div>
            <h3 className="font-heading text-base font-bold text-foreground">
              Join a community in order to see its events.
            </h3>
            <p className="mt-1 text-xs text-muted-foreground max-w-sm leading-relaxed">
              You are not currently enrolled in any community. Join a community
              to start viewing class schedules, exam dates, and lecture times.
            </p>
            <Link
              to="/communities"
              className={cn(
                buttonVariants({ size: "sm" }),
                "mt-4 gap-2 text-xs font-semibold cursor-pointer",
              )}
            >
              <Compass className="size-4" />
              Explore Communities
            </Link>
          </div>
        ) : (
          /* Empty State 2: User has communities, but none selected yet */
          <div className="flex min-h-[360px] flex-col items-center justify-center rounded-2xl border bg-card p-12 text-center shadow-xs">
            <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-4">
              <CalendarIcon className="size-6" />
            </div>
            <h3 className="font-heading text-base font-bold text-foreground">
              Select a community to see its events.
            </h3>
            <p className="mt-1 text-xs text-muted-foreground max-w-sm leading-relaxed">
              Choose one of your enrolled communities from the dropdown above to
              display its calendar.
            </p>
          </div>
        )
      ) : isLoadingEvents ? (
        /* Loading events state */
        <div className="flex min-h-[360px] flex-col items-center justify-center rounded-2xl border bg-card p-12 text-center shadow-xs">
          <Spinner className="size-8 text-primary" />
          <p className="mt-3 text-xs font-semibold text-muted-foreground">
            Loading events...
          </p>
        </div>
      ) : (
        /* Active Calendar Grid / Agenda View */
        <div className="@container w-full space-y-4">
          {/* Add Event Button */}
          {canCreateEvent && (
            <div className="flex justify-end">
              <Button
                size="sm"
                onClick={() => openCreateModal()}
                className="gap-1.5 font-semibold cursor-pointer shrink-0"
              >
                <Plus className="size-4" />
                <span>Add Event</span>
              </Button>
            </div>
          )}

          {/* Automatic Container Query Mode */}
          {viewMode === "auto" && (
            <>
              <div className="hidden @[640px]:block">
                <CalendarMonthGrid
                  events={filteredEvents}
                  canCreateEvent={canCreateEvent}
                />
              </div>
              <div className="block @[640px]:hidden">
                <CalendarAgendaList events={filteredEvents} />
              </div>
            </>
          )}

          {/* Explicit Month Grid Mode */}
          {viewMode === "month" && (
            <CalendarMonthGrid
              events={filteredEvents}
              canCreateEvent={canCreateEvent}
            />
          )}

          {/* Explicit Agenda List Mode */}
          {viewMode === "list" && (
            <CalendarAgendaList events={filteredEvents} />
          )}
        </div>
      )}

      {/* Modals subscribing directly to useCalendarStore */}
      <EventDetailModal />
      <EventFormModal />
      <DayOverflowModal
        events={filteredEvents}
        canCreateEvent={canCreateEvent}
      />
    </div>
  );
}
