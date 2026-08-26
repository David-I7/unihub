import { useMemo } from "react";
import {
  CalendarMonthGrid,
  CalendarToolbar,
  DayOverflowModal,
  EventDetailModal,
  EventFormModal,
  useCalendarEvents,
  useCalendarState,
  type CalendarEvent,
} from "@/features/calendar";
import { Spinner } from "@/components/ui/spinner";

function getLocalDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export default function CalendarPage() {
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
  const { data: rawEvents, isLoading, isFetching } = useCalendarEvents({
    year: currentDate.getFullYear(),
    month: currentDate.getMonth() + 1,
    communitySlug: communitySlug || undefined,
    studyYear: studyYear && studyYear !== "ALL_YEARS" ? studyYear : undefined,
    courseSlug: courseSlug && courseSlug !== "ALL_COURSES" ? courseSlug : undefined,
    type: selectedType !== "ALL" ? selectedType : undefined,
  });

  // Guarantee rawEvents is converted to a valid array
  const eventsList: CalendarEvent[] = useMemo(() => {
    if (Array.isArray(rawEvents)) return rawEvents;
    const dataObj = rawEvents as Record<string, unknown> | null | undefined;
    if (dataObj && Array.isArray(dataObj.content)) {
      return dataObj.content as CalendarEvent[];
    }
    if (dataObj && Array.isArray(dataObj.data)) {
      return dataObj.data as CalendarEvent[];
    }
    return [];
  }, [rawEvents]);

  // Client-side search filtering
  const filteredEvents = useMemo(() => {
    if (!searchQuery.trim()) return eventsList;
    const q = searchQuery.toLowerCase().trim();
    return eventsList.filter((ev) => {
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
  }, [eventsList, searchQuery]);

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
          Community Calendar
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
      />

      {/* Month Calendar Grid View */}
      {isLoading ? (
        <div className="flex h-96 flex-col items-center justify-center rounded-2xl border bg-card p-12 text-center shadow-xs">
          <Spinner className="size-8 text-primary" />
          <p className="mt-3 text-xs font-semibold text-muted-foreground">
            Loading events...
          </p>
        </div>
      ) : (
        <CalendarMonthGrid
          currentDate={currentDate}
          events={filteredEvents}
          onSelectEvent={handleSelectEvent}
          onSelectDate={handleSelectDate}
          onOpenOverflow={handleOpenOverflow}
        />
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
