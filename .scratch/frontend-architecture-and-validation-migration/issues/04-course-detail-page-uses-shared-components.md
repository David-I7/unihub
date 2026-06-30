Status: ready-for-agent

# Course Detail Page Uses Shared Components

## Parent

.scratch/frontend-architecture-and-validation-migration/PRD.md

## What to build

Move Course detail behavior into a route-level page that consumes loaded Course data from the shared layout context. Use shared components, Tailwind, and shadcn primitives to preserve the Materials, Assignments, Lectures, Exams, Grade Breakdown, and Course-not-found experiences.

## Acceptance criteria

- [ ] Valid Course detail routes render the Course title and professors.
- [ ] Materials, Assignments, Lectures, and Exams remain separated by tabs.
- [ ] Materials remain grouped by type and assignment/exam Materials stay out of the general Materials tab.
- [ ] Assignment Deadlines still show due date, description, submission URL, Grade Weight, status, and linked assignment Materials when present.
- [ ] Course Sessions still show timing, location, and scheduled/cancelled/computed completed status.
- [ ] Exams still support known dates, unknown dates, Grade Weight, and linked exam Materials.
- [ ] Grade Breakdown still shows known Grade Weights and incomplete status.
- [ ] Missing Course routes still show a clear not-found state.
- [ ] Course detail uses Tailwind and suitable shadcn primitives instead of page-specific CSS rules.
- [ ] `npm run lint`, `npm test`, and `npm run build` pass.

## Blocked by

- .scratch/frontend-architecture-and-validation-migration/issues/02-app-layout-owns-academic-context.md
