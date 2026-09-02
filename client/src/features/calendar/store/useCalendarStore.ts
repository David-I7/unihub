import { create } from "zustand";
import type { Event, EventType } from "../api/types";
import type { StudyYearNameDto } from "@/features/studyYears";

interface CalendarState {
  currentDate: Date;
  viewMode: "auto" | "month" | "list";
  communitySlug: string | null;
  studyYear: StudyYearNameDto | null;
  courseSlug: string | null;
  selectedType: EventType | "All";
  searchQuery: string;
  selectedEventId: string | null;
  isFormModalOpen: boolean;
  formDefaultDate: string | undefined;
  editingEvent: Event | null;
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
  openEditModal: (event: Event) => void;
  closeFormModal: () => void;
  openEventDetails: (eventId: string) => void;
  closeEventDetails: () => void;
  openOverflowModal: (dateStr: string) => void;
  closeOverflowModal: () => void;
  hydrateFromUrl: (params: {
    currentDate?: Date;
    viewMode?: "auto" | "month" | "list";
    communitySlug?: string | null;
    studyYear?: StudyYearNameDto | null;
    courseSlug?: string | null;
    selectedType?: EventType | "All";
    searchQuery?: string;
  }) => void;
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
  selectedEventId: null,
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
      editingEvent: event,
      isFormModalOpen: true,
    }),
  closeFormModal: () =>
    set({
      isFormModalOpen: false,
      editingEvent: null,
      formDefaultDate: undefined,
    }),
  openEventDetails: (eventId) => set({ selectedEventId: eventId }),
  closeEventDetails: () => set({ selectedEventId: null }),
  openOverflowModal: (dateStr) => set({ overflowDate: dateStr }),
  closeOverflowModal: () => set({ overflowDate: null }),
  hydrateFromUrl: (params) =>
    set((state) => {
      const updates: Partial<CalendarState> = {};
      if (params.currentDate !== undefined && params.currentDate.getTime() !== state.currentDate.getTime()) {
        updates.currentDate = params.currentDate;
      }
      if (params.viewMode !== undefined && params.viewMode !== state.viewMode) {
        updates.viewMode = params.viewMode;
      }
      if (params.communitySlug !== undefined && params.communitySlug !== state.communitySlug) {
        updates.communitySlug = params.communitySlug;
      }
      if (params.studyYear !== undefined && params.studyYear !== state.studyYear) {
        updates.studyYear = params.studyYear;
      }
      if (params.courseSlug !== undefined && params.courseSlug !== state.courseSlug) {
        updates.courseSlug = params.courseSlug;
      }
      if (params.selectedType !== undefined && params.selectedType !== state.selectedType) {
        updates.selectedType = params.selectedType;
      }
      if (params.searchQuery !== undefined && params.searchQuery !== state.searchQuery) {
        updates.searchQuery = params.searchQuery;
      }
      return Object.keys(updates).length > 0 ? updates : state;
    }),
}));
