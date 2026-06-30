Status: completed

# Issue 04: Contribution Form Dynamic Validation

## Parent

[.scratch/lazy-loading-courses/PRD.md](file:///C:/Users/Dave2swag/Desktop/projects/agents/unihub/.scratch/lazy-loading-courses/PRD.md)

## What to build

Refactor the contribution validation workflow to validate draft JSON payloads against dynamically loaded course data instead of a static, in-memory repository:
1. Update `contributionPayloadFromText` and the Contribute page form to dynamically pull course data for the selected target course if it isn't already loaded.
2. Run duplicate local ID checks and total grade weight limit checks against the target course's dynamic data.
3. Update validation warning/error presentation on the Contribute page to handle async loading states gracefully.

## Acceptance criteria

- [x] Validation errors and warnings are correctly generated on the Contribute page when inputting payload data.
- [x] Grade weight totals are calculated based on the dynamically loaded target course.
- [x] Duplicate local ID validation checks successfully prevent adding duplicate materials or calendar events.

## Blocked by

- [.scratch/lazy-loading-courses/issues/01-implement-dual-mode-repository-loader.md](file:///C:/Users/Dave2swag/Desktop/projects/agents/unihub/.scratch/lazy-loading-courses/issues/01-implement-dual-mode-repository-loader.md)
