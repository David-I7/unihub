# Course Detail Tabs

Status: ready-for-human

## Parent

.scratch/unihub-course-platform/PRD.md

## What to build

Build Course detail pages for the selected Course. Each page should show Course title, professors, and tabs for Materials, Assignments, Lectures, and Exams. The page should present Course data according to the domain rules: general Materials grouped by type, Assignment Deadline Materials shown through Assignments, exam Materials shown through Exams, explicit lecture Course Sessions with Session Status, multiple Exams, unknown Exam dates, and Grade Breakdown.

This slice should make a Course independently useful to students even before Calendar and Contribution flows are complete.

## Acceptance criteria

- [ ] Course detail route resolves a Course from its Course Path.
- [ ] Course header shows Course title and professors.
- [ ] Course detail exposes Materials, Assignments, Lectures, and Exams tabs.
- [ ] Materials tab groups course, seminar, lab, and other Materials by type.
- [ ] Materials tab excludes assignment and exam Materials.
- [ ] Assignments tab lists Assignment Deadlines sorted by `dueAt`.
- [ ] Assignment Deadline details show due date, description, submission URL, Grade Weight when known, and linked assignment Materials.
- [ ] Assignment Deadline status is derived from `dueAt`.
- [ ] Lectures tab lists Course Sessions sorted by `startsAt`.
- [ ] Course Sessions show start/end time, optional location, and scheduled, cancelled, or computed completed state.
- [ ] Exams tab supports multiple Exams, shows date to be announced when `startsAt` is missing, and shows linked exam Materials.
- [ ] Grade Breakdown shows known Assignment Deadline and Exam Grade Weights and clearly treats incomplete totals as incomplete.
- [ ] Tests verify tab separation, Material visibility rules, linked Material rendering, Session Status display, unknown Exam date handling, and Grade Breakdown behavior.

## Blocked by

- .scratch/unihub-course-platform/issues/01-static-course-data-foundation.md
- .scratch/unihub-course-platform/issues/02-teams-like-app-shell-and-context-selection.md
