Status: ready-for-agent

# Diff/new-state GitHub issue and PR handoff

## Parent

.scratch/course-about-and-contribution-workflow/PRD.md

## What to build

Make GitHub handoff output review-focused and fix pull request assist links. Generated GitHub issue bodies and PR bodies contain only the proposed diff and resulting new state. Student-facing Suggestion summaries remain human-readable before handoff. Pull request assist links target canonical public data files, use edit links for existing files, and use a create-file link for new Course JSON while carrying the Catalog diff in copied PR content.

## Acceptance criteria

- [ ] Generated GitHub issue bodies contain only diff and new state.
- [ ] Generated GitHub issue bodies omit validation chatter, warnings, raw form metadata, and explanatory prose.
- [ ] Generated PR bodies contain only diff and new state.
- [ ] Student in-app Suggestion summaries remain human-readable before GitHub handoff.
- [ ] Existing Course and Catalog PR assist links target canonical public data files with GitHub edit links.
- [ ] New Course PR assist uses a GitHub create-file link for the new Course JSON where possible.
- [ ] New Course PR assist includes the Catalog diff in copied PR content.
- [ ] PR assist explains that plain GitHub file URLs cannot atomically create the Course file and edit Catalog in one step.
- [ ] Tests cover issue body generation, PR body generation, canonical link targets, and new Course handoff behavior.
- [ ] The repository test suite and production build pass.

## Blocked by

- .scratch/course-about-and-contribution-workflow/issues/06-new-course-two-file-contribution-output.md
