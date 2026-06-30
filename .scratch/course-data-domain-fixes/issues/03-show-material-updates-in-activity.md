Status: completed

# Show Material updates in Activity

## Parent

.scratch/course-data-domain-fixes/PRD.md

## What to build

Represent Material updates with an optional `updatedAt` timestamp and surface those updates in Activity alongside existing added Course items. Activity should distinguish added events from Material update events, stay filtered to the selected academic context, and sort all events newest first by the timestamp for that event.

## Acceptance criteria

- [x] Material records accept optional `updatedAt` without rejecting otherwise valid Course data.
- [x] Existing `addedAt` Activity behavior remains for Materials, Assignment Deadlines, Course Sessions, and Exams.
- [x] Materials with `updatedAt` produce Activity items that are visibly update events, not added events.
- [x] Activity sorts additions and Material updates together newest first by the relevant event timestamp.
- [x] Activity remains filtered to the selected Academic Year, Study Year, and Semester.
- [x] Cancelled Course Session additions keep showing their cancelled context.
- [x] Activity panel timestamp display uses the timestamp for the event being shown.
- [x] Tests cover added items, Material updates, sorting, and selected-context filtering.

## Blocked by

- .scratch/course-data-domain-fixes/issues/02-support-video-materials-end-to-end.md
