Status: ready-for-agent

# Batch add controls for repeated Course items

## Parent

.scratch/course-about-and-contribution-workflow/PRD.md

## What to build

Make repeated Course item creation explicit in the maintainer Contribution flow. Materials, Assignment Deadlines, Exams, and Course Sessions can be added in batches through clear `Add another ...` controls. Course metadata edits, new Course creation, Academic Year creation, Study Year creation, and Semester creation remain singular. Student Suggestion flows always create exactly one item and never expose add-another controls.

## Acceptance criteria

- [ ] Add Material Contribution UI exposes an explicit `Add another material` action.
- [ ] Add Assignment Deadline Contribution UI exposes an explicit `Add another assignment` action.
- [ ] Add Exam Contribution UI exposes an explicit `Add another exam` action.
- [ ] Add Course Session Contribution UI exposes an explicit `Add another lecture` action.
- [ ] Each `Add another ...` action appends a new editable item instead of rendering a non-functional button.
- [ ] Batch-generated payloads validate for Materials, Assignment Deadlines, Exams, and Course Sessions.
- [ ] Single-item generated Contributions use single-item validation wording, not multi-item wording.
- [ ] Student Suggestion forms create one item only and do not expose add-another controls.
- [ ] Duplicate IDs inside a batch are still blocked.
- [ ] Structural Contribution types remain singular and do not expose add-another controls.
- [ ] Metadata edits remain singular and do not expose add-another controls.
- [ ] Tests cover batch payload generation/validation and singular-type guardrails.
- [ ] The repository test suite and production build pass.

## Blocked by

- .scratch/course-about-and-contribution-workflow/issues/02-exam-and-assignment-deadline-data-shape-alignment.md
