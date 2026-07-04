Status: ready-for-agent

# Exam and Assignment Deadline data shape alignment

## Parent

.scratch/course-about-and-contribution-workflow/PRD.md

## What to build

Align Exam and Assignment Deadline behavior across validation, Contribution payloads, Suggestion/Contribution forms, and Course detail display. Exams require Grade Weight and may include optional description and location. Assignment Deadline submission instructions live in description, `submissionUrl` is removed, and Assignment Deadline Grade Weight remains optional.

## Acceptance criteria

- [ ] Exam validation rejects missing Grade Weight.
- [ ] Exam validation accepts optional description.
- [ ] Exam validation accepts optional location.
- [ ] Assignment Deadline validation accepts missing Grade Weight.
- [ ] Assignment Deadline validation rejects `submissionUrl`.
- [ ] Assignment Deadline forms no longer ask for a separate submission URL.
- [ ] Assignment Deadline descriptions are used for notes and submission instructions.
- [ ] Exam forms include required Grade Weight and optional description/location.
- [ ] Assignment cards show description and no submission URL field.
- [ ] Exam cards show description, location, and required Grade Weight when present.
- [ ] Existing date-to-be-announced Exam behavior is preserved.
- [ ] Tests cover repository validation, Contribution validation, and Course detail display behavior.
- [ ] The repository test suite and production build pass.

## Blocked by

- .scratch/course-about-and-contribution-workflow/issues/01-course-about-section-and-difficulty-contract.md
