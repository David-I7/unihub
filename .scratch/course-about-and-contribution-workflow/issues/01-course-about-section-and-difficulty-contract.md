Status: ready-for-agent

# Course About section and difficulty contract

## Parent

.scratch/course-about-and-contribution-workflow/PRD.md

## What to build

Add the Course About experience end to end. Course records require Material Difficulty and Passing Difficulty with the controlled values `easy`, `medium`, `hard`, and `unknown`. Course detail pages show an About section with Course description, color-coded difficulty badges, and a Grade Breakdown derived from known Assignment Deadline and Exam Grade Weight values. Home course cards stay compact and do not show difficulty fields.

## Acceptance criteria

- [ ] Course validation rejects missing Material Difficulty or Passing Difficulty.
- [ ] Course validation rejects difficulty values outside `easy`, `medium`, `hard`, and `unknown`.
- [ ] Existing Course data with explicit `unknown` difficulty values remains valid.
- [ ] New Course generation defaults both difficulty fields to `unknown`.
- [ ] Course metadata edits can update Material Difficulty and Passing Difficulty.
- [ ] Course detail About shows Course description, Material Difficulty, Passing Difficulty, and Grade Breakdown.
- [ ] Difficulty badges use green for `easy`, amber for `medium`, red for `hard`, and neutral gray for `unknown`.
- [ ] Grade Breakdown shows known Assignment Deadline and Exam percentages only.
- [ ] Assignment-specific and exam-specific notes are not duplicated in About.
- [ ] Home course cards still show only Course title and professor names.
- [ ] Tests cover validation, Course detail derivation/display behavior, and new Course/default metadata behavior.
- [ ] The repository test suite and production build pass.

## Blocked by

None - can start immediately.
