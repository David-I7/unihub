# Teams-Like App Shell And Context Selection

Status: ready-for-human

## Parent

.scratch/unihub-course-platform/PRD.md

## What to build

Build the first student-facing shell for UniHub using the loaded Course hierarchy. The app should use React Router hash routing, a Teams-inspired desktop app rail, mobile bottom navigation, Home context selectors, local selection persistence, and a Course grid where each Course card shows only Course title and professors.

This slice should make the static Course data navigable from the Home page without implementing full Course details yet.

## Acceptance criteria

- [ ] React Router hash routing is used for Home, Calendar, Contribute, and Course detail route placeholders.
- [ ] Desktop layout provides an app rail for Home, Calendar, and Contribute.
- [ ] Mobile layout provides bottom navigation for Home, Calendar, and Contribute.
- [ ] Home allows students to select Academic Year, Study Year, and Semester from catalog data.
- [ ] The selected Academic Year, Study Year, and Semester are persisted locally and restored on reload.
- [ ] Home shows only Courses belonging to the selected Academic Year, Study Year, and Semester.
- [ ] Course cards show Course title and professor names only.
- [ ] Clicking a Course navigates to that Course's hash route.
- [ ] Tests verify selector behavior, local persistence, route generation, and Course card content from user-visible behavior.

## Blocked by

- .scratch/unihub-course-platform/issues/01-static-course-data-foundation.md
