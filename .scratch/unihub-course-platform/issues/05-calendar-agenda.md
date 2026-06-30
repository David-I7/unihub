# Calendar Agenda

Status: ready-for-agent

## Parent

.scratch/unihub-course-platform/PRD.md

## What to build

Build the Calendar page as an agenda/list view derived from Course data. Calendar Events should come from Assignment Deadlines, Course Sessions, and Exams with known `startsAt`. The page should support filters for Academic Year, Study Year, Semester, Course, event type, and time range, defaulting to upcoming events for the selected context.

This slice should make deadlines, lectures, and exams visible in one place without duplicating a separate calendar data source.

## Acceptance criteria

- [ ] Calendar Events are derived from Assignment Deadlines, Course Sessions, and Exams with known `startsAt`.
- [ ] Exams without `startsAt` do not appear as dated Calendar Events.
- [ ] Calendar defaults to upcoming events for the selected Academic Year, Study Year, and Semester.
- [ ] Calendar can show all events when the time range filter is changed.
- [ ] Filters exist for Academic Year, Study Year, Semester, Course, event type, and time range.
- [ ] Event type filters cover assignments, exams, and lectures.
- [ ] Agenda items show event title, Course, date/time, and relevant status such as cancelled lecture or due assignment.
- [ ] Calendar does not require or maintain a separate calendar dataset.
- [ ] Tests verify event derivation, default filtering, filter combinations, unknown Exam date exclusion, and visible agenda content.

## Blocked by

- .scratch/unihub-course-platform/issues/01-static-course-data-foundation.md
- .scratch/unihub-course-platform/issues/02-teams-like-app-shell-and-context-selection.md
- .scratch/unihub-course-platform/issues/03-course-detail-tabs.md
