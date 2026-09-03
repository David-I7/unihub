import { create } from "zustand";
import type { Event } from "../api/types";

interface CalendarState {
  selectedEventId: string | null;
  isFormModalOpen: boolean;
  formDefaultDate: string | undefined;
  editingEvent: Event | null;
  overflowDate: string | null;
}

interface CalendarActions {
  openCreateModal: (defaultDate?: string) => void;
  openEditModal: (event: Event) => void;
  closeFormModal: () => void;
  openEventDetails: (eventId: string) => void;
  closeEventDetails: () => void;
  openOverflowModal: (dateStr: string) => void;
  closeOverflowModal: () => void;
}

export type CalendarStore = CalendarState & CalendarActions;

export const useCalendarStore = create<CalendarStore>((set) => ({
  // Initial state
  selectedEventId: null,
  isFormModalOpen: false,
  formDefaultDate: undefined,
  editingEvent: null,
  overflowDate: null,

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
}));
