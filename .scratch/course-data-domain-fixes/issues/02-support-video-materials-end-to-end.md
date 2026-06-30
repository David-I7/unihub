Status: completed

# Support video Materials end to end

## Parent

.scratch/course-data-domain-fixes/PRD.md

## What to build

Support `video` as a first-class Material type from validation through Course detail display and Contribution guidance. Students should see video Materials in the general Materials tab, contributors should be able to submit them, and maintainers should keep the existing special Material Reference rules for assignments and exams.

## Acceptance criteria

- [x] Course and Contribution validation accept `video` as a valid Material type.
- [x] Invalid Material types still produce blocking validation errors.
- [x] The Course detail Materials tab includes video Materials with course, seminar, lab, and other Materials.
- [x] Assignment Deadline Material References still require assignment Materials.
- [x] Exam Material References still require exam Materials.
- [x] Contribution schema guidance and sample payloads list the current Material shape and include `video`.
- [x] Domain tests prove video Materials validate and appear in Course detail output.

## Blocked by

- .scratch/course-data-domain-fixes/issues/01-canonicalize-public-catalog-and-course-data-paths.md
