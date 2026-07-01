# Build Assignment Deadline Task Flow

Status: ready-for-agent

## Parent

.scratch/simplified-course-contribution-flow/PRD.md

## What to build

Build the form-driven Add Assignment Deadline task. Contributors should enter assignment title, due date/time, optional description, optional submission URL, optional Grade Weight, and assignment Materials. The flow should support selecting existing assignment Materials and creating new compatible assignment Materials in the same Contribution.

The generated Course update must keep Material References canonical while hiding `materialIds` from normal contributors.

## Acceptance criteria

- [ ] Add Assignment Deadline is presented as a normal form, not a JSON editor.
- [ ] `dueAt` is captured with date/time controls and remains required.
- [ ] Existing assignment Materials can be selected by display information.
- [ ] New assignment Materials can be created inline with external URL validation.
- [ ] Generated Assignment Deadline references compatible assignment Materials by ID in repository JSON.
- [ ] Generated new assignment Materials include IDs, `addedAt`, and `updatedAt`.
- [ ] Validation rejects references to missing or non-assignment Materials.
- [ ] Issue and pull request assist output include the generated Course change.
- [ ] Tests cover existing Material attachment, inline new Material creation, missing due date, wrong Material type, and generated output.

## Blocked by

- .scratch/simplified-course-contribution-flow/issues/02-introduce-generated-contribution-payloads.md
- .scratch/simplified-course-contribution-flow/issues/04-build-material-task-flows.md
