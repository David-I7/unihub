import { useState } from "react";
import type { CalendarEvent, EventType } from "../api/types";

export function useCalendarState() {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [communitySlug, setCommunitySlug] = useState<string | null>(null);
  const [studyYear, setStudyYear] = useState<string | null>(null);
  const [courseSlug, setCourseSlug] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<EventType | "ALL_TYPES">(
    "ALL_TYPES",
  );
  const [searchQuery, setSearchQuery] = useState("");

  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
    null,
  );
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [formDefaultDate, setFormDefaultDate] = useState<string | undefined>(
    undefined,
  );
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [overflowDate, setOverflowDate] = useState<string | null>(null);

  return {
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
  };
}
