Status: completed

# Issue 03: Direct Route Lazy Loading (Deep Linking)

## Parent

[.scratch/lazy-loading-courses/PRD.md](file:///C:/Users/Dave2swag/Desktop/projects/agents/unihub/.scratch/lazy-loading-courses/PRD.md)

## What to build

Update the course detail page route handler to support dynamic loading when a user deep-links directly to a specific course page.
1. When navigating directly to a Course page URL, if the target semester context is not yet loaded in state, trigger an asynchronous load for the course data in that context.
2. Render a loading indicator while the data is loading.
3. Once loaded, render the detailed tabs (materials, assignments, lectures, exams) and the grade breakdown.

## Acceptance criteria

- [x] Navigating directly or refreshing on a route like `#/courses/2025-2026/year-2/semester-1/algorithms` successfully loads and renders the course details.
- [x] A loading state is displayed if the course details are not yet in memory.
- [x] If a course or path does not exist, a "Course not found" view is displayed after loading completes.

## Blocked by

- [.scratch/lazy-loading-courses/issues/01-implement-dual-mode-repository-loader.md](file:///C:/Users/Dave2swag/Desktop/projects/agents/unihub/.scratch/lazy-loading-courses/issues/01-implement-dual-mode-repository-loader.md)
