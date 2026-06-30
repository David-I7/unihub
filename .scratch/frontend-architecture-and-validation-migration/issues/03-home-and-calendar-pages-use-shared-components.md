Status: ready-for-agent

# Home and Calendar Pages Use Shared Components

## Parent

.scratch/frontend-architecture-and-validation-migration/PRD.md

## What to build

Move the Home and Calendar route behavior into route-level pages that consume the shared layout context. Replace bespoke page styling with Tailwind and appropriate shadcn primitives while preserving the Course grid, Activity panel, Calendar agenda, and filters.

## Acceptance criteria

- [ ] Home renders Courses for the selected Academic Year, Study Year, and Semester.
- [ ] Course cards still show only Course title and professors.
- [ ] Activity remains filtered to the selected academic context and sorted newest first.
- [ ] Desktop Home keeps Activity beside the Course grid, and mobile Home keeps Activity below it.
- [ ] Calendar still renders an agenda derived from Assignment Deadlines, Course Sessions, and Exams with known start datetimes.
- [ ] Calendar Course, event type, and time range filters still update the visible agenda.
- [ ] Home and Calendar use Tailwind and suitable shadcn primitives instead of page-specific CSS rules.
- [ ] Navigation and academic context actions use lucide icons where relevant while retaining visible text labels.
- [ ] `npm run lint`, `npm test`, and `npm run build` pass.

## Blocked by

- .scratch/frontend-architecture-and-validation-migration/issues/02-app-layout-owns-academic-context.md
