# Build Exam Task Flow

Status: ready-for-agent

## Parent

.scratch/simplified-course-contribution-flow/PRD.md

## What to build

Build the form-driven Add Exam task. Contributors should enter Exam title, optional date/time, optional Grade Weight, and exam Materials. The flow should support selecting existing exam Materials and creating new compatible exam Materials in the same Contribution. Undated Exams remain valid with a warning and do not produce Calendar Events.

The generated Course update must keep Material References canonical while hiding `materialIds` from normal contributors.

## Acceptance criteria

- [ ] Add Exam is presented as a normal form, not a JSON editor.
- [ ] Exam date/time is optional and captured with date/time controls when provided.
- [ ] Undated Exams are valid and produce a visible warning.
- [ ] Existing exam Materials can be selected by display information.
- [ ] New exam Materials can be created inline with external URL validation.
- [ ] Generated Exams reference compatible exam Materials by ID in repository JSON.
- [ ] Generated new exam Materials include IDs, `addedAt`, and `updatedAt`.
- [ ] Dated Exams still produce Calendar Events, and undated Exams do not.
- [ ] Issue and pull request assist output include the generated Course change.
- [ ] Tests cover dated Exam, undated Exam warning, existing Material attachment, inline new Material creation, wrong Material type, Calendar behavior, and generated output.

## Blocked by

- .scratch/simplified-course-contribution-flow/issues/02-introduce-generated-contribution-payloads.md
- .scratch/simplified-course-contribution-flow/issues/04-build-material-task-flows.md
