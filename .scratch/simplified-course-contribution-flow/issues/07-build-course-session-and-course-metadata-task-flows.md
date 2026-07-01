# Build Course Session And Course Metadata Task Flows

Status: ready-for-agent

## Parent

.scratch/simplified-course-contribution-flow/PRD.md

## What to build

Build the remaining form-driven Contribution tasks: Add Course Session and Edit Course metadata. Course Session contributors should enter title, start/end date and time, optional location, and status with scheduled as the default while still allowing cancelled. Course metadata contributors should edit Course title, professors, and optional description through normal fields.

Both flows should validate, generate repository JSON, and support issue and pull request assist output without exposing raw JSON input.

## Acceptance criteria

- [ ] Add Course Session is presented as a normal form with date/time controls for `startsAt` and `endsAt`.
- [ ] Course Session status defaults to scheduled and supports cancelled.
- [ ] Course Session generation includes local ID, `addedAt`, and `updatedAt`.
- [ ] Validation blocks Course Sessions whose end is not after start.
- [ ] Edit Course metadata is presented as a normal form for title, professors, and optional description.
- [ ] Edit Course metadata preserves unrelated Course data.
- [ ] Issue and pull request assist output work for both tasks.
- [ ] Tests cover scheduled session default, cancelled session, invalid timing, metadata update, and generated output.

## Blocked by

- .scratch/simplified-course-contribution-flow/issues/02-introduce-generated-contribution-payloads.md
