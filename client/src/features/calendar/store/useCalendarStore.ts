import { create } from "zustand";
import type { CalendarEvent, EventType } from "../api/types";
import type { StudyYearNameDto } from "@/features/studyYears";

interface CalendarState {
  currentDate: Date;
  viewMode: "auto" | "month" | "list";
  communitySlug: string | null;
  studyYear: StudyYearNameDto | null;
  courseSlug: string | null;
  selectedType: EventType | "All";
  searchQuery: string;
  selectedEvent: CalendarEvent | null;
  isFormModalOpen: boolean;
  formDefaultDate: string | undefined;
  editingEvent: CalendarEvent | null;
  overflowDate: string | null;
}

interface CalendarActions {
  setCurrentDate: (date: Date) => void;
  goToPrevMonth: () => void;
  goToNextMonth: () => void;
  goToToday: () => void;
  setViewMode: (mode: "auto" | "month" | "list") => void;
  setCommunitySlug: (slug: string | null) => void;
  setStudyYear: (year: StudyYearNameDto | null) => void;
  setCourseSlug: (courseSlug: string | null) => void;
  setSelectedType: (type: EventType | "All") => void;
  setSearchQuery: (query: string) => void;
  openCreateModal: (defaultDate?: string) => void;
  openEditModal: (event: CalendarEvent) => void;
  closeFormModal: () => void;
  openEventDetails: (event: CalendarEvent) => void;
  closeEventDetails: () => void;
  openOverflowModal: (dateStr: string) => void;
  closeOverflowModal: () => void;
}

export type CalendarStore = CalendarState & CalendarActions;

export const useCalendarStore = create<CalendarStore>((set) => ({
  // Initial state
  currentDate: new Date(),
  viewMode: "auto",
  communitySlug: null,
  studyYear: null,
  courseSlug: null,
  selectedType: "All",
  searchQuery: "",
  selectedEvent: null,
  isFormModalOpen: false,
  formDefaultDate: undefined,
  editingEvent: null,
  overflowDate: null,

  // Navigation actions
  setCurrentDate: (date) => set({ currentDate: date }),
  goToPrevMonth: () =>
    set((state) => ({
      currentDate: new Date(
        state.currentDate.getFullYear(),
        state.currentDate.getMonth() - 1,
        1,
      ),
    })),
  goToNextMonth: () =>
    set((state) => ({
      currentDate: new Date(
        state.currentDate.getFullYear(),
        state.currentDate.getMonth() + 1,
        1,
      ),
    })),
  goToToday: () => set({ currentDate: new Date() }),
  setViewMode: (viewMode) => set({ viewMode }),

  // Filter actions with automatic child resets
  setCommunitySlug: (communitySlug) =>
    set({
      communitySlug,
      studyYear: null,
      courseSlug: null,
    }),
  setStudyYear: (studyYear) =>
    set({
      studyYear,
      courseSlug: null,
    }),
  setCourseSlug: (courseSlug) => set({ courseSlug }),
  setSelectedType: (selectedType) => set({ selectedType }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),

  // Modal / Selection actions
  openCreateModal: (defaultDate) =>
    set({
      formDefaultDate: defaultDate,
      editingEvent: null,
      isFormModalOpen: true,
    }),
  openEditModal: (event) =>
    set({
      selectedEvent: null,
      editingEvent: event,
      isFormModalOpen: true,
    }),
  closeFormModal: () =>
    set({
      isFormModalOpen: false,
      editingEvent: null,
      formDefaultDate: undefined,
    }),
  openEventDetails: (event) => set({ selectedEvent: event }),
  closeEventDetails: () => set({ selectedEvent: null }),
  openOverflowModal: (dateStr) => set({ overflowDate: dateStr }),
  closeOverflowModal: () => set({ overflowDate: null }),
}));
