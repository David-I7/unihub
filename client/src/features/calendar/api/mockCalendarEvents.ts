import type { CalendarEvent } from "./types";

/**
 * Temporary mock data for testing the calendar UI.
 * To remove:
 * 1. Delete this file (`mockCalendarEvents.ts`).
 * 2. Set `USE_MOCK_EVENTS = false` in `client/src/pages/CalendarPage.tsx`.
 */

export function getMockCalendarEventsForMonth(
  year: number,
  month: number, // 1 - 12
): CalendarEvent[] {
  const pad = (n: number) => String(n).padStart(2, "0");
  const monthStr = pad(month);

  const createIso = (
    day: number,
    hour: number,
    minute: number = 0,
  ): string => {
    return `${year}-${monthStr}-${pad(day)}T${pad(hour)}:${pad(minute)}:00.000Z`;
  };

  return [
    {
      id: `mock-ev-${year}-${month}-1`,
      title: "Algorithms & Data Structures Midterm",
      description:
        "Written examination covering Binary Search Trees, AVL Trees, Red-Black Trees, and Hash Tables.\n\nAllowed materials: 1 handwritten A4 formula sheet.",
      type: "EXAM",
      startTime: createIso(8, 9, 0),
      endTime: createIso(8, 11, 0),
      durationMinutes: 120,
      location: "IN_PERSON",
      locationDetails: "Amphitheater 2 (A2), Central Building Floor 1",
      courseId: 101,
      courseSlug: "structuri-de-date",
      courseName: "Data Structures & Algorithms",
      courseAbbreviation: "SDA",
      communitySlug: "cs-faculty",
      createdAt: createIso(1, 8, 0),
      updatedAt: createIso(1, 8, 0),
      owner: { id: "user-prof-1", username: "dr_popescu" },
      isSubscribed: true,
      reminders: [
        {
          id: "rem-1",
          eventId: `mock-ev-${year}-${month}-1`,
          offsetMinutes: 30,
          remindAt: createIso(8, 8, 30),
          status: "PENDING",
          createdAt: createIso(2, 10, 0),
        },
      ],
    },
    {
      id: `mock-ev-${year}-${month}-2`,
      title: "MIPS Assembly Parser Submission",
      description:
        "Submit the Mars MIPS assembly homework on GitLab. Ensure all unit tests pass with zero memory alignment faults.",
      type: "ASSIGNMENT",
      startTime: createIso(12, 23, 59),
      endTime: createIso(13, 0, 0),
      durationMinutes: 1,
      location: "ONLINE",
      locationDetails: "https://gitlab.university.edu/asc/homework-1",
      courseId: 102,
      courseSlug: "arhitectura-sistemelor-de-calcul",
      courseName: "Computer Systems Architecture",
      courseAbbreviation: "ASC",
      communitySlug: "cs-faculty",
      createdAt: createIso(2, 9, 0),
      updatedAt: createIso(2, 9, 0),
      owner: { id: "user-ta-1", username: "radu_ionescu" },
      isSubscribed: false,
      reminders: [],
    },
    {
      id: `mock-ev-${year}-${month}-3`,
      title: "Web Technologies: Modern React & TanStack Lecture",
      description:
        "Deep dive into client-side caching, optimistic updates, and component architecture in TypeScript.",
      type: "LECTURE",
      startTime: createIso(14, 10, 0),
      endTime: createIso(14, 12, 0),
      durationMinutes: 120,
      location: "HYBRID",
      locationDetails: "Room 301 & Google Meet (https://meet.google.com/unihub-web-lec)",
      courseId: 103,
      courseSlug: "tehnici-web",
      courseName: "Web Technologies",
      courseAbbreviation: "TW",
      communitySlug: "cs-faculty",
      createdAt: createIso(3, 10, 0),
      updatedAt: createIso(3, 10, 0),
      owner: { id: "user-prof-2", username: "prof_andrei" },
      isSubscribed: true,
      reminders: [
        {
          id: "rem-2",
          eventId: `mock-ev-${year}-${month}-3`,
          offsetMinutes: 15,
          remindAt: createIso(14, 9, 45),
          status: "PENDING",
          createdAt: createIso(3, 11, 0),
        },
      ],
    },
    // Crowded day to test overflow popup (+2 more)
    {
      id: `mock-ev-${year}-${month}-4`,
      title: "Relational Database Normalization Lab Quiz",
      description:
        "15-minute quick test on 1NF, 2NF, 3NF, and BCNF functional dependencies.",
      type: "EXAM",
      startTime: createIso(18, 8, 30),
      endTime: createIso(18, 9, 0),
      durationMinutes: 30,
      location: "IN_PERSON",
      locationDetails: "Lab 204",
      courseId: 104,
      courseSlug: "baze-de-date",
      courseName: "Database Systems",
      courseAbbreviation: "BD",
      communitySlug: "cs-faculty",
      createdAt: createIso(4, 9, 0),
      updatedAt: createIso(4, 9, 0),
      owner: { id: "user-prof-3", username: "maria_db" },
      isSubscribed: false,
      reminders: [],
    },
    {
      id: `mock-ev-${year}-${month}-5`,
      title: "SQL Query Optimization Assignment Due",
      description:
        "Index benchmarking report comparing B-Tree vs Hash index scan timings on 1M rows.",
      type: "ASSIGNMENT",
      startTime: createIso(18, 14, 0),
      endTime: createIso(18, 14, 0),
      durationMinutes: 0,
      location: "ONLINE",
      locationDetails: "https://moodle.university.edu/mod/assign/view.php?id=8492",
      courseId: 104,
      courseSlug: "baze-de-date",
      courseName: "Database Systems",
      courseAbbreviation: "BD",
      communitySlug: "cs-faculty",
      createdAt: createIso(4, 10, 0),
      updatedAt: createIso(4, 10, 0),
      owner: { id: "user-prof-3", username: "maria_db" },
      isSubscribed: true,
      reminders: [
        {
          id: "rem-3",
          eventId: `mock-ev-${year}-${month}-5`,
          offsetMinutes: 60,
          remindAt: createIso(18, 13, 0),
          status: "PENDING",
          createdAt: createIso(5, 12, 0),
        },
      ],
    },
    {
      id: `mock-ev-${year}-${month}-6`,
      title: "Computer Architecture Review Session",
      description:
        "Optional Q&A review session covering pipelining hazards and cache hit rate calculations.",
      type: "LECTURE",
      startTime: createIso(18, 16, 0),
      endTime: createIso(18, 18, 0),
      durationMinutes: 120,
      location: "ONLINE",
      locationDetails: "https://meet.google.com/asc-review-session",
      courseId: 102,
      courseSlug: "arhitectura-sistemelor-de-calcul",
      courseName: "Computer Systems Architecture",
      courseAbbreviation: "ASC",
      communitySlug: "cs-faculty",
      createdAt: createIso(5, 14, 0),
      updatedAt: createIso(5, 14, 0),
      owner: { id: "user-ta-1", username: "radu_ionescu" },
      isSubscribed: false,
      reminders: [],
    },
    {
      id: `mock-ev-${year}-${month}-7`,
      title: "Team Project Check-in #2",
      description:
        "Show demo of backend API routes and authentication flow to teaching assistants.",
      type: "ASSIGNMENT",
      startTime: createIso(18, 19, 0),
      endTime: createIso(18, 20, 0),
      durationMinutes: 60,
      location: "IN_PERSON",
      locationDetails: "Open Study Lounge, Floor 2",
      courseId: 103,
      courseSlug: "tehnici-web",
      courseName: "Web Technologies",
      courseAbbreviation: "TW",
      communitySlug: "cs-faculty",
      createdAt: createIso(5, 15, 0),
      updatedAt: createIso(5, 15, 0),
      owner: { id: "user-prof-2", username: "prof_andrei" },
      isSubscribed: false,
      reminders: [],
    },
    // Late month events
    {
      id: `mock-ev-${year}-${month}-8`,
      title: "Guest Talk: High-Performance Distributed Systems",
      description:
        "Industry lecture on building fault-tolerant services, consensus protocols, and stream processing at scale.",
      type: "LECTURE",
      startTime: createIso(24, 14, 30),
      endTime: createIso(24, 16, 30),
      durationMinutes: 120,
      location: "HYBRID",
      locationDetails: "Aula Magna & Zoom (ID: 981 2231 4455)",
      courseId: 101,
      courseSlug: "structuri-de-date",
      courseName: "Data Structures & Algorithms",
      courseAbbreviation: "SDA",
      communitySlug: "cs-faculty",
      createdAt: createIso(6, 11, 0),
      updatedAt: createIso(6, 11, 0),
      owner: { id: "user-prof-1", username: "dr_popescu" },
      isSubscribed: false,
      reminders: [],
    },
    {
      id: `mock-ev-${year}-${month}-9`,
      title: "Final Term Project Submission",
      description:
        "Final code repository link and 5-page design report submission deadline. No late submissions accepted.",
      type: "ASSIGNMENT",
      startTime: createIso(27, 23, 59),
      endTime: createIso(28, 0, 0),
      durationMinutes: 1,
      location: "ONLINE",
      locationDetails: "https://moodle.university.edu/course/view.php?id=302",
      courseId: 103,
      courseSlug: "tehnici-web",
      courseName: "Web Technologies",
      courseAbbreviation: "TW",
      communitySlug: "cs-faculty",
      createdAt: createIso(7, 12, 0),
      updatedAt: createIso(7, 12, 0),
      owner: { id: "user-prof-2", username: "prof_andrei" },
      isSubscribed: true,
      reminders: [
        {
          id: "rem-4",
          eventId: `mock-ev-${year}-${month}-9`,
          offsetMinutes: 1440, // 1 day before
          remindAt: createIso(26, 23, 59),
          status: "PENDING",
          createdAt: createIso(7, 14, 0),
        },
      ],
    },
  ];
}

export const MOCK_CALENDAR_EVENTS = getMockCalendarEventsForMonth(
  new Date().getFullYear(),
  new Date().getMonth() + 1,
);
