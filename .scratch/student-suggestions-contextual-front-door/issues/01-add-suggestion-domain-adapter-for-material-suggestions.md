Status: ready-for-agent

# Add Suggestion domain adapter for material suggestions

## Parent

.scratch/student-suggestions-contextual-front-door/PRD.md

## What to build

Build the first end-to-end student-facing Suggestion path at the domain level for Materials. Given a Course, a material suggestion intent, and student input, the system should validate the request, produce a human-readable student summary, produce a student-facing GitHub issue title/body, and include maintainer-facing generated Contribution details.

This slice should cover the Materials intents:

- Add missing material
- Fix an existing material
- Report a broken link

The implementation should reuse the existing Contribution generation and validation behavior through a thin Suggestion adapter instead of duplicating course data mutation logic.

## Acceptance criteria

- [ ] Material Suggestions produce student-facing summaries that do not lead with raw Contribution type names.
- [ ] Material Suggestions produce GitHub issue titles such as `Suggestion: Add material to <Course>`.
- [ ] Material Suggestion issue bodies lead with the student-facing summary and include a secondary generated Contribution section for maintainers.
- [ ] Corrections to existing Material information require a note/source.
- [ ] Adding a missing Material can proceed without a note/source when the rest of the input is valid.
- [ ] Invalid Material Suggestion input is blocked by the existing Contribution validation behavior.
- [ ] Generated GitHub links target `David-I7/unihub`.
- [ ] Tests cover the external suggestion-to-GitHub-output behavior.

## Blocked by

None - can start immediately
