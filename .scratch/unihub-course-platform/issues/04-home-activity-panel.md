# Home Activity Panel

Superseded note: `.scratch/course-data-domain-fixes/issues/03-show-material-updates-in-activity.md` supersedes the statement that Activity represents newly inserted items only. Activity now includes Material update events from `updatedAt` as well as additions from `addedAt`.

Status: ready-for-human

## Parent

.scratch/unihub-course-platform/PRD.md

## What to build

Build the Home Activity panel from optional `addedAt` timestamps on Materials, Assignment Deadlines, Course Sessions, and Exams. Activity should be derived from loaded Course data and filtered to the selected Academic Year, Study Year, and Semester. It should represent newly inserted items only, not updates or cancellations.

Desktop should show Activity as a right-side panel on Home. Mobile should show Activity below the Course grid.

## Acceptance criteria

- [ ] Activity includes Materials, Assignment Deadlines, Course Sessions, and Exams that have `addedAt`.
- [ ] Activity excludes Course items without `addedAt`.
- [ ] Activity is filtered to the selected Academic Year, Study Year, and Semester.
- [ ] Activity is sorted newest first and shows the latest items regardless of age.
- [ ] Activity item text identifies the item, its type, and its Course.
- [ ] Cancelled Course Sessions can appear in Activity when they have `addedAt`, with status made clear.
- [ ] Desktop layout shows Activity in a right-side Home panel.
- [ ] Mobile layout shows Activity below the Course grid.
- [ ] Tests verify Activity derivation, filtering, sorting, and responsive placement from user-visible behavior.

## Blocked by

- .scratch/unihub-course-platform/issues/01-static-course-data-foundation.md
- .scratch/unihub-course-platform/issues/02-teams-like-app-shell-and-context-selection.md
