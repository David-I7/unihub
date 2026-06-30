# Contribution Validation Core

Status: ready-for-human

## Parent

.scratch/unihub-course-platform/PRD.md

## What to build

Build the reusable validation core for Contributions. The same data rules that protect repository Course data should validate user-generated Contributions in the browser. Invalid Contributions are blocked. Incomplete but valid Contributions are allowed with warnings.

This slice does not need the full Contribute page UI; it should expose the behavior needed by both GitHub issue mode and pull request assist mode.

## Acceptance criteria

- [ ] Contribution validation can validate adding Material, Assignment Deadline, Exam, Course Session, editing Course metadata, and adding a new Course.
- [ ] Contribution validation reuses or aligns with the catalog and Course data schema rules.
- [ ] Invalid Contributions are blocked with actionable errors.
- [ ] Incomplete but valid Contributions return warnings without blocking.
- [ ] Validation blocks broken JSON, missing required fields, duplicate local IDs, invalid Material References, Assignment Deadlines without `dueAt`, assignment references to non-assignment Materials, exam references to non-exam Materials, Course Sessions whose end is before their start, invalid Session Status, and Grade Weight totals above 100.
- [ ] Validation warns for Grade Weight totals below 100, missing professors, Exams without `startsAt`, Courses with no Materials, and missing optional `addedAt`.
- [ ] Tests cover both blocking errors and allowed warnings for each Contribution type.

## Blocked by

- .scratch/unihub-course-platform/issues/01-static-course-data-foundation.md
