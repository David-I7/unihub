import { useState } from "react";
import { useNavigate } from "react-router";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Search,
  AlertCircle,
  FileText,
  Video,
  Filter,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PrototypeBanner } from "../components/PrototypeBanner";
import { ProtoCalendarMonthView } from "../components/ProtoCalendarMonthView";
import { ProtoEventRegisterModal } from "../components/ProtoEventRegisterModal";
import { ProtoEventDetailModal } from "../components/ProtoEventDetailModal";
import {
  INITIAL_CALENDAR_EVENTS,
  type MockCalendarEvent,
  type CalendarEventType,
} from "../data/mockCalendarData";
import { MOCK_COMMUNITIES } from "../data/mockAcademicData";

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export default function ProtoCalendarPage() {
  const navigate = useNavigate();

  // Default to January 2026 (active examination & project session in mock data)
  const [currentDate, setCurrentDate] = useState<Date>(new Date(2026, 0, 15));
  const [events, setEvents] = useState<MockCalendarEvent[]>(INITIAL_CALENDAR_EVENTS);

  // Filters & Modals
  const [selectedEventType, setSelectedEventType] = useState<"ALL" | CalendarEventType>("ALL");
  const [selectedCommunityId, setSelectedCommunityId] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEvent, setSelectedEvent] = useState<MockCalendarEvent | null>(null);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [registerDefaultDate, setRegisterDefaultDate] = useState<string | undefined>(undefined);

  // Month Navigation Handlers
  const handlePrevMonth = () => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date(2026, 0, 15)); // Reset to January 2026 demo focal point
  };

  // Event Handlers
  const handleSaveNewEvent = (newEvent: MockCalendarEvent) => {
    setEvents((prev) => [newEvent, ...prev]);
  };

  const handleDeleteEvent = (id: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== id));
  };

  const handleToggleStar = (id: string) => {
    setEvents((prev) =>
      prev.map((e) => (e.id === id ? { ...e, isStarred: !e.isStarred } : e))
    );
  };

  const handleSelectDate = (dateStr: string) => {
    setRegisterDefaultDate(dateStr);
    setIsRegisterModalOpen(true);
  };

  // Filtered Events
  const filteredEvents = events.filter((ev) => {
    // Type filter
    if (selectedEventType !== "ALL" && ev.type !== selectedEventType) {
      return false;
    }
    // Community filter
    if (selectedCommunityId !== "all" && ev.communityId !== selectedCommunityId) {
      return false;
    }
    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = ev.title.toLowerCase().includes(q);
      const matchAbbr = ev.courseAbbr.toLowerCase().includes(q);
      const matchCourseName = ev.courseName.toLowerCase().includes(q);
      const matchRoom = ev.roomOrPlatform?.toLowerCase().includes(q);
      if (!matchTitle && !matchAbbr && !matchCourseName && !matchRoom) {
        return false;
      }
    }
    return true;
  });

  // Summary counts for the current filtered scope
  const totalExams = filteredEvents.filter((e) => e.type === "EXAM").length;
  const totalAssignments = filteredEvents.filter((e) => e.type === "ASSIGNMENT").length;
  const totalLectures = filteredEvents.filter((e) => e.type === "LECTURE").length;

  const currentYear = currentDate.getFullYear();
  const currentMonthName = MONTH_NAMES[currentDate.getMonth()];

  return (
    <div className="min-h-full space-y-6">
      {/* Prototype Flow Banner */}
      <PrototypeBanner />

      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/90 via-emerald-800 to-slate-900 p-6 md:p-8 text-white shadow-lg">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs backdrop-blur-xs font-medium">
              <CalendarIcon className="size-3.5 text-amber-300 animate-pulse" />
              <span>UniHub Academic Calendar • Mina-Scheduler Interface</span>
            </div>
            <h1 className="font-heading text-2xl md:text-3xl font-extrabold tracking-tight">
              Community Calendar
            </h1>
            <p className="text-xs md:text-sm text-white/80 leading-relaxed">
              Track and register exams, assignment deadlines, and lecture sessions across your faculty communities. Click any event to jump directly to its Course Offering Hub.
            </p>

            {/* Quick Summary Chips */}
            <div className="flex flex-wrap items-center gap-2 pt-2 text-xs">
              <span className="rounded-md bg-rose-500/30 text-rose-100 px-2.5 py-1 font-semibold flex items-center gap-1.5 backdrop-blur-xs">
                <AlertCircle className="size-3.5" /> {totalExams} Exams
              </span>
              <span className="rounded-md bg-amber-500/30 text-amber-100 px-2.5 py-1 font-semibold flex items-center gap-1.5 backdrop-blur-xs">
                <FileText className="size-3.5" /> {totalAssignments} Assignments
              </span>
              <span className="rounded-md bg-blue-500/30 text-blue-100 px-2.5 py-1 font-semibold flex items-center gap-1.5 backdrop-blur-xs">
                <Video className="size-3.5" /> {totalLectures} Lectures
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row md:flex-col gap-2 shrink-0">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setRegisterDefaultDate(undefined);
                setIsRegisterModalOpen(true);
              }}
              className="bg-white text-slate-900 hover:bg-white/90 font-semibold shadow-xs flex items-center justify-center gap-1.5"
            >
              <Plus className="size-4 text-primary" /> Register Event
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/proto/teachers")}
              className="border-white/30 text-white hover:bg-white/10 flex items-center justify-center gap-1.5"
            >
              <BookOpen className="size-4" /> Explore Teachers Hub ↗
            </Button>
          </div>
        </div>

        {/* Ambient Glow */}
        <div className="absolute -right-12 -bottom-12 size-64 rounded-full bg-emerald-400/10 blur-3xl" />
        <div className="absolute -left-12 -top-12 size-64 rounded-full bg-teal-400/10 blur-3xl" />
      </div>

      {/* Calendar Control Bar & Navigation Toolbar (Mina-Scheduler Header Style) */}
      <div className="rounded-2xl border bg-card p-4 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Month / Year Navigator */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 rounded-xl border bg-muted/30 p-1">
              <button
                type="button"
                onClick={handlePrevMonth}
                title="Previous Month"
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-background transition-colors cursor-pointer"
              >
                <ChevronLeft className="size-4" />
              </button>
              <button
                type="button"
                onClick={handleToday}
                className="px-3 py-1 text-xs font-semibold rounded-lg text-foreground hover:bg-background transition-colors cursor-pointer"
              >
                Today
              </button>
              <button
                type="button"
                onClick={handleNextMonth}
                title="Next Month"
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-background transition-colors cursor-pointer"
              >
                <ChevronRight className="size-4" />
              </button>
            </div>

            <h2 className="font-heading text-lg md:text-xl font-extrabold text-foreground tracking-tight">
              {currentMonthName} {currentYear}
            </h2>

            <span className="rounded-full bg-primary/10 text-primary px-2.5 py-0.5 text-[11px] font-bold">
              Month View
            </span>
          </div>

          {/* Filters & Community Selector */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Search Input */}
            <div className="relative w-full sm:w-48">
              <Search className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Filter events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border bg-background pl-8 pr-3 py-1.5 text-xs outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            {/* Community Dropdown Selector */}
            <div className="flex items-center gap-1">
              <select
                value={selectedCommunityId}
                onChange={(e) => setSelectedCommunityId(e.target.value)}
                className="rounded-xl border bg-background px-3 py-1.5 text-xs font-medium focus:ring-1 focus:ring-primary outline-none"
              >
                <option value="all">All Communities ({MOCK_COMMUNITIES.length})</option>
                {MOCK_COMMUNITIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Primary Action Button */}
            <Button
              size="sm"
              onClick={() => {
                setRegisterDefaultDate(undefined);
                setIsRegisterModalOpen(true);
              }}
              className="gap-1 shadow-xs font-semibold"
            >
              <Plus className="size-3.5" /> Add Event
            </Button>
          </div>
        </div>

        {/* Event Category Filter Chips */}
        <div className="flex items-center justify-between border-t pt-3 flex-wrap gap-2 text-xs">
          <div className="flex items-center gap-1.5 overflow-x-auto">
            <span className="text-muted-foreground font-medium text-[11px] mr-1 flex items-center gap-1">
              <Filter className="size-3" /> Category:
            </span>
            <button
              type="button"
              onClick={() => setSelectedEventType("ALL")}
              className={`rounded-lg px-3 py-1 text-xs font-bold transition-all cursor-pointer ${
                selectedEventType === "ALL"
                  ? "bg-primary text-primary-foreground shadow-2xs"
                  : "bg-muted/40 text-muted-foreground hover:bg-muted"
              }`}
            >
              All Events ({events.length})
            </button>
            <button
              type="button"
              onClick={() => setSelectedEventType("EXAM")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-bold transition-all cursor-pointer ${
                selectedEventType === "EXAM"
                  ? "bg-rose-600 text-white shadow-2xs"
                  : "bg-rose-500/10 text-rose-700 dark:text-rose-300 hover:bg-rose-500/20"
              }`}
            >
              <AlertCircle className="size-3" /> Exams
            </button>
            <button
              type="button"
              onClick={() => setSelectedEventType("ASSIGNMENT")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-bold transition-all cursor-pointer ${
                selectedEventType === "ASSIGNMENT"
                  ? "bg-amber-600 text-white shadow-2xs"
                  : "bg-amber-500/10 text-amber-700 dark:text-amber-300 hover:bg-amber-500/20"
              }`}
            >
              <FileText className="size-3" /> Assignments
            </button>
            <button
              type="button"
              onClick={() => setSelectedEventType("LECTURE")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-bold transition-all cursor-pointer ${
                selectedEventType === "LECTURE"
                  ? "bg-blue-600 text-white shadow-2xs"
                  : "bg-blue-500/10 text-blue-700 dark:text-blue-300 hover:bg-blue-500/20"
              }`}
            >
              <Video className="size-3" /> Lectures
            </button>
          </div>

          <div className="text-[11px] text-muted-foreground">
            Showing <strong>{filteredEvents.length}</strong> events in current view
          </div>
        </div>
      </div>

      {/* Month Calendar Component */}
      <ProtoCalendarMonthView
        currentDate={currentDate}
        events={filteredEvents}
        onSelectEvent={(ev) => setSelectedEvent(ev)}
        onSelectDate={handleSelectDate}
      />

      {/* Event Details Modal */}
      <ProtoEventDetailModal
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
        onDeleteEvent={handleDeleteEvent}
        onToggleStar={handleToggleStar}
      />

      {/* Event Registration Modal */}
      <ProtoEventRegisterModal
        isOpen={isRegisterModalOpen}
        defaultDate={registerDefaultDate}
        onClose={() => setIsRegisterModalOpen(false)}
        onSaveEvent={handleSaveNewEvent}
      />
    </div>
  );
}
