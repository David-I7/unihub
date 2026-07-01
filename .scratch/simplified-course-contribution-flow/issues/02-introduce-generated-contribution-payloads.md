# Introduce Generated Contribution Payloads

Status: ready-for-agent

## Parent

.scratch/simplified-course-contribution-flow/PRD.md

## What to build

Add a domain-level layer that turns task-shaped Contribution input into validated repository JSON. This layer should derive Course and Course item IDs, generate `addedAt` and `updatedAt`, generate required empty arrays for new Courses, compute target Course Paths, and continue producing issue and pull request assist output through the existing Contribution preparation behavior.

This slice should make the later UI work easy: task forms should call a high-level API rather than constructing JSON directly.

## Acceptance criteria

- [ ] A high-level Contribution payload API exists for task-shaped inputs without requiring callers to provide raw JSON text.
- [ ] Add new Course input derives a deterministic, readable, path-safe Course ID from Course title.
- [ ] Course item inputs derive deterministic, readable, path-safe local IDs from user-facing labels.
- [ ] Generated IDs are collision-aware within the target Semester or Course.
- [ ] New Course generation includes required empty child arrays.
- [ ] New item generation sets `addedAt` and `updatedAt` to the same creation timestamp.
- [ ] Update generation preserves original `addedAt` and replaces `updatedAt`.
- [ ] Generated output still supports GitHub issue mode and pull request assist mode.
- [ ] Domain tests cover ID generation, timestamp generation, collision handling, and generated issue/PR output.
- [ ] Existing Contribution preparation tests remain passing.

## Blocked by

- .scratch/simplified-course-contribution-flow/issues/01-tighten-course-item-validation-and-sample-data.md
