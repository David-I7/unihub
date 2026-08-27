import { useMemo, useState } from "react";
import {
  CalendarAgendaList,
  CalendarMonthGrid,
  CalendarToolbar,
  DayOverflowModal,
  EventDetailModal,
  EventFormModal,
  getMockCalendarEventsForMonth,
  useCalendarEvents,
  useCalendarState,
  type CalendarEvent,
} from "@/features/calendar";
import { Spinner } from "@/components/ui/spinner";

/**
 * Temporary toggle for UI testing.
 * Set to false or delete when backend calendar events are populated.
 */
const USE_MOCK_EVENTS = true;

function getLocalDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export default function CalendarPage() {
  const [viewMode, setViewMode] = useState<"auto" | "month" | "list">("auto");

  const {
    currentDate,
    setCurrentDate,
    communitySlug,
    setCommunitySlug,
    studyYear,
    setStudyYear,
    courseSlug,
    setCourseSlug,
    selectedType,
    setSelectedType,
    searchQuery,
    setSearchQuery,
    selectedEvent,
    setSelectedEvent,
    isFormModalOpen,
    setIsFormModalOpen,
    formDefaultDate,
    setFormDefaultDate,
    editingEvent,
    setEditingEvent,
    overflowDate,
    setOverflowDate,
  } = useCalendarState();

  // Fetch events for active year, month, and filters
  const {
    data: rawEvents,
    isLoading,
    isFetching,
  } = useCalendarEvents({
    year: currentDate.getFullYear(),
    month: currentDate.getMonth() + 1,
    communitySlug: communitySlug || undefined,
    studyYear: studyYear && studyYear !== "ALL_YEARS" ? studyYear : undefined,
    courseSlug:
      courseSlug && courseSlug !== "ALL_COURSES" ? courseSlug : undefined,
    type: selectedType !== "ALL" ? selectedType : undefined,
  });

  const eventsList = useMemo(() => {
    if (rawEvents && rawEvents.length > 0) return rawEvents;
    if (USE_MOCK_EVENTS) {
      return getMockCalendarEventsForMonth(
        currentDate.getFullYear(),
        currentDate.getMonth() + 1,
      );
    }
    return [];
  }, [rawEvents, currentDate]);

  // Client-side search and category filtering
  const filteredEvents = useMemo(() => {
    let list = eventsList;

    if (selectedType !== "ALL") {
      list = list.filter((e) => e.type === selectedType);
    }
    if (communitySlug && communitySlug !== "ALL_COMMUNITIES") {
      list = list.filter(
        (e) => !e.communitySlug || e.communitySlug === communitySlug,
      );
    }
    if (courseSlug && courseSlug !== "ALL_COURSES") {
      list = list.filter((e) => !e.courseSlug || e.courseSlug === courseSlug);
    }

    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase().trim();
    return list.filter((ev) => {
      const matchTitle = ev.title.toLowerCase().includes(q);
      const matchCourseName = ev.courseName?.toLowerCase().includes(q);
      const matchCourseSlug = ev.courseSlug?.toLowerCase().includes(q);
      const matchLocation = ev.locationDetails?.toLowerCase().includes(q);
      const matchDescription = ev.description?.toLowerCase().includes(q);
      return (
        matchTitle ||
        matchCourseName ||
        matchCourseSlug ||
        matchLocation ||
        matchDescription
      );
    });
  }, [eventsList, selectedType, communitySlug, courseSlug, searchQuery]);

  // Counts for category badges
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

  // Month navigation
  const handlePrevMonth = () => {
    setCurrentDate(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1),
    );
  };

  const handleNextMonth = () => {
    setCurrentDate(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1),
    );
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Modal handlers
  const handleAddEvent = () => {
    setFormDefaultDate(undefined);
    setEditingEvent(null);
    setIsFormModalOpen(true);
  };

  const handleSelectDate = (dateStr: string) => {
    setFormDefaultDate(dateStr);
    setEditingEvent(null);
    setIsFormModalOpen(true);
  };

  const handleSelectEvent = (event: CalendarEvent) => {
    setSelectedEvent(event);
  };

  const handleEditEvent = (event: CalendarEvent) => {
    setSelectedEvent(null);
    setEditingEvent(event);
    setIsFormModalOpen(true);
  };

  const handleOpenOverflow = (dateStr: string) => {
    setOverflowDate(dateStr);
  };

  // Events for overflow modal
  const overflowEvents = useMemo(() => {
    if (!overflowDate) return [];
    return filteredEvents.filter((e) => {
      const d = new Date(e.startTime);
      return getLocalDateKey(d) === overflowDate;
    });
  }, [filteredEvents, overflowDate]);

  return (
    <div className="min-h-full space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl md:text-3xl font-bold tracking-tight text-foreground">
          Calendar
        </h1>
        {isFetching && !isLoading && (
          <div className="inline-flex items-center gap-2 text-xs text-muted-foreground">
            <Spinner className="size-3.5" />
            <span>Updating...</span>
          </div>
        )}
      </div>

      {/* Control Toolbar */}
      <CalendarToolbar
        currentDate={currentDate}
        onPrevMonth={handlePrevMonth}
        onNextMonth={handleNextMonth}
        onToday={handleToday}
        onAddEvent={handleAddEvent}
        communitySlug={communitySlug}
        onCommunityChange={setCommunitySlug}
        studyYear={studyYear}
        onStudyYearChange={setStudyYear}
        courseSlug={courseSlug}
        onCourseChange={setCourseSlug}
        selectedType={selectedType}
        onTypeChange={setSelectedType}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        examCount={examCount}
        assignmentCount={assignmentCount}
        lectureCount={lectureCount}
        totalCount={eventsList.length}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      {/* Calendar View Container */}
      {isLoading ? (
        <div className="flex h-96 flex-col items-center justify-center rounded-2xl border bg-card p-12 text-center shadow-xs">
          <Spinner className="size-8 text-primary" />
          <p className="mt-3 text-xs font-semibold text-muted-foreground">
            Loading events...
          </p>
        </div>
      ) : (
        <div className="@container w-full">
          {/* Automatic Container Query Mode */}
          {viewMode === "auto" && (
            <>
              <div className="hidden @[640px]:block">
                <CalendarMonthGrid
                  currentDate={currentDate}
                  events={filteredEvents}
                  onSelectEvent={handleSelectEvent}
                  onSelectDate={handleSelectDate}
                  onOpenOverflow={handleOpenOverflow}
                />
              </div>
              <div className="block @[640px]:hidden">
                <CalendarAgendaList
                  currentDate={currentDate}
                  events={filteredEvents}
                  onSelectEvent={handleSelectEvent}
                />
              </div>
            </>
          )}

          {/* Explicit Month Grid Mode */}
          {viewMode === "month" && (
            <CalendarMonthGrid
              currentDate={currentDate}
              events={filteredEvents}
              onSelectEvent={handleSelectEvent}
              onSelectDate={handleSelectDate}
              onOpenOverflow={handleOpenOverflow}
            />
          )}

          {/* Explicit Agenda List Mode */}
          {viewMode === "list" && (
            <CalendarAgendaList
              currentDate={currentDate}
              events={filteredEvents}
              onSelectEvent={handleSelectEvent}
            />
          )}
        </div>
      )}

      {/* Event Details Modal */}
      <EventDetailModal
        event={selectedEvent}
        isOpen={Boolean(selectedEvent)}
        onClose={() => setSelectedEvent(null)}
        onEdit={handleEditEvent}
      />

      {/* Event Creation & Edit Modal */}
      <EventFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setEditingEvent(null);
        }}
        defaultDate={formDefaultDate}
        editingEvent={editingEvent}
        defaultCommunitySlug={communitySlug}
      />

      {/* Crowded Day Overflow Modal */}
      <DayOverflowModal
        dateStr={overflowDate}
        events={overflowEvents}
        isOpen={Boolean(overflowDate)}
        onClose={() => setOverflowDate(null)}
        onSelectEvent={handleSelectEvent}
        onAddEventOnDate={handleSelectDate}
      />
    </div>
  );
}
