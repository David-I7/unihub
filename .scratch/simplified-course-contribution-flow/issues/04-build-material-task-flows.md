# Build Material Task Flows

Status: ready-for-agent

## Parent

.scratch/simplified-course-contribution-flow/PRD.md

## What to build

Build form-driven Add Material and Update Material Contribution tasks. Contributors should choose or target a Course, enter normal Material fields, choose Material type from controlled options, and provide an external URL. The app should generate or preserve IDs/timestamps as appropriate, validate the result, and produce issue or PR assist output.

This slice establishes the Material form pattern used by Assignment Deadline and Exam task flows.

## Acceptance criteria

- [ ] Add Material is presented as a form with title, type, and external URL fields.
- [ ] Update Material lets contributors select an existing Material by display information rather than typing a local ID.
- [ ] Material type is chosen from the valid Material type vocabulary.
- [ ] Add Material generates a local ID plus `addedAt` and `updatedAt`.
- [ ] Update Material preserves original `addedAt` and replaces `updatedAt`.
- [ ] Non-external Material URLs are rejected before generated issue or PR output is considered valid.
- [ ] Issue mode includes generated Material changes in the prefilled issue body.
- [ ] Pull request assist mode provides generated JSON/PR content and the relevant GitHub edit link when possible.
- [ ] Tests cover valid Add Material, valid Update Material, invalid URL, invalid type, and missing update target behavior.

## Blocked by

- .scratch/simplified-course-contribution-flow/issues/02-introduce-generated-contribution-payloads.md
