Status: completed

# Allow Grade Weight totals above 100

## Parent

.scratch/course-data-domain-fixes/PRD.md

## What to build

Allow Course and Contribution validation to accept Grade Weight totals above 100 while preserving useful validation for numeric Grade Weight values and warnings for incomplete totals below 100. Grade Breakdown should display the actual known total without assuming 100 is a hard upper bound.

## Acceptance criteria

- [x] Course validation no longer blocks Grade Weight totals above 100.
- [x] Contribution validation no longer blocks additions that push Grade Weight totals above 100.
- [x] Grade Weight totals below 100 still warn when grading data is present.
- [x] Individual Grade Weight values still must be numeric when provided.
- [x] Grade Breakdown shows actual known totals above 100 without treating them as invalid.
- [x] Existing duplicate local ID, Material Reference, Course Session timing, Session Status, malformed Catalog, and unsupported batch validation tests remain passing.
- [x] Tests prove Course validation and Contribution preparation accept totals above 100.

## Blocked by

- .scratch/course-data-domain-fixes/issues/01-canonicalize-public-catalog-and-course-data-paths.md
