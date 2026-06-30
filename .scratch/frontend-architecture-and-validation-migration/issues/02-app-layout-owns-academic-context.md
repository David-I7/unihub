Status: ready-for-agent

# App Layout Owns Academic Context

## Parent

.scratch/frontend-architecture-and-validation-migration/PRD.md

## What to build

Split the shared app shell out of the large app module so that the layout owns primary navigation, selected Academic Year, Study Year, Semester, local persistence, course loading, loading states, and load errors. Route pages should consume the shared academic context instead of reimplementing it.

## Acceptance criteria

- [ ] Home, Calendar, Contribute, and Course detail routes still work through hash routing.
- [ ] Desktop app rail and mobile bottom navigation remain available with visible labels.
- [ ] The selected Academic Year, Study Year, and Semester are still remembered in local storage.
- [ ] Direct Course routes still initialize the selected academic context from the Course Path.
- [ ] Course loading still shows a loading state and load failures still show an error state.
- [ ] Route-level screens no longer own shared app shell, persistence, or course-loading responsibilities.
- [ ] Existing tests continue to pass, and any new tests verify user-visible behavior rather than internal module names.

## Blocked by

- .scratch/frontend-architecture-and-validation-migration/issues/01-frontend-migration-foundation.md
