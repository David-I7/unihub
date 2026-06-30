Status: completed

# Issue 02: Semester-Level Lazy Loading

## Parent

[.scratch/lazy-loading-courses/PRD.md](file:///C:/Users/Dave2swag/Desktop/projects/agents/unihub/.scratch/lazy-loading-courses/PRD.md)

## What to build

Update the application shell and the home page to load courses for the selected semester context asynchronously:
1. Replace top-level synchronous course imports with a dynamic, asynchronous React state in `App.tsx`.
2. When the user changes their Academic Year, Study Year, or Semester selection in the UI, trigger a parallel dynamic fetch of all courses belonging to that specific context.
3. Show a visual loading indicator while courses are being loaded.
4. Ensure that the Home page (including its Activity feed) and the Calendar page views wait for the data to be loaded before rendering their contents.

## Acceptance criteria

- [x] Courses are loaded only for the selected context.
- [x] A loading spinner or indicator is visible during course fetching.
- [x] The Home page grid, Activity feed, and Calendar agenda correctly render data from the dynamic course state.
- [x] Changing context fetches the new context and updates all derived views.

## Blocked by

- [.scratch/lazy-loading-courses/issues/01-implement-dual-mode-repository-loader.md](file:///C:/Users/Dave2swag/Desktop/projects/agents/unihub/.scratch/lazy-loading-courses/issues/01-implement-dual-mode-repository-loader.md)
