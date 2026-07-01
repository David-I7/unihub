# Tighten Course Item Validation And Sample Data

Status: ready-for-agent

## Parent

.scratch/simplified-course-contribution-flow/PRD.md

## What to build

Align the Course data contract with the sharpened domain model. Materials, Assignment Deadlines, Course Sessions, and Exams must all require `addedAt` and `updatedAt`; Material URLs must be external URLs; sample Course data must validate against those rules; and Activity must be able to derive additions and updates from the required timestamps.

This is the foundation slice for the simplified Contribution flow: once complete, repository validation should reject stale Course item shapes and local Material URLs before any UI work begins.

## Acceptance criteria

- [ ] Materials, Assignment Deadlines, Course Sessions, and Exams require both `addedAt` and `updatedAt` in runtime validation and TypeScript domain types.
- [ ] Validation rejects missing `addedAt` or missing `updatedAt` on any Course item type.
- [ ] Validation accepts valid external Material URLs and rejects relative, site-root, and repository-local Material URLs.
- [ ] Existing sample Course data is migrated so repository validation passes under the tightened rules.
- [ ] Activity derives addition and update events from `addedAt` and `updatedAt` across Materials, Assignment Deadlines, Course Sessions, and Exams.
- [ ] Activity distinguishes additions from updates and preserves selected academic context filtering and newest-first ordering.
- [ ] Existing Calendar behavior remains intact, including undated Exams staying out of Calendar Events.
- [ ] Domain tests cover the tightened timestamp and Material URL behavior.
- [ ] The repository test script passes.

## Blocked by

None - can start immediately
