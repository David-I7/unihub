# Remove Raw JSON From Normal Contribution UI

Status: ready-for-agent

## Parent

.scratch/simplified-course-contribution-flow/PRD.md

## What to build

Complete the Contribution page transition from raw JSON editing to task-shaped forms. The normal flow should let contributors choose a Contribution task, fill in domain fields, see validation feedback, and generate issue or PR assist output without seeing a JSON textarea or schema guide as the primary experience.

This slice is a UI completion pass after all task flows exist.

## Acceptance criteria

- [ ] The normal Contribution page no longer renders a raw JSON textarea.
- [ ] The normal Contribution page no longer depends on a schema-guide modal as the contributor's main source of instructions.
- [ ] Contributors can choose among the supported Contribution tasks and see the relevant task form.
- [ ] Local IDs, `addedAt`, `updatedAt`, and `materialIds` are not primary contributor inputs.
- [ ] Validation errors are shown in the task flow near the relevant fields or in a clear validation panel.
- [ ] Warnings are visible but non-blocking.
- [ ] The page remains responsive on mobile and desktop layouts.
- [ ] UI tests prove Add new Course can be completed without raw JSON or Course ID entry.
- [ ] UI tests prove Add Exam can be completed without raw JSON or Material ID entry.
- [ ] Existing domain tests remain passing.

## Blocked by

- .scratch/simplified-course-contribution-flow/issues/03-build-add-new-course-task-flow.md
- .scratch/simplified-course-contribution-flow/issues/04-build-material-task-flows.md
- .scratch/simplified-course-contribution-flow/issues/05-build-assignment-deadline-task-flow.md
- .scratch/simplified-course-contribution-flow/issues/06-build-exam-task-flow.md
- .scratch/simplified-course-contribution-flow/issues/07-build-course-session-and-course-metadata-task-flows.md
