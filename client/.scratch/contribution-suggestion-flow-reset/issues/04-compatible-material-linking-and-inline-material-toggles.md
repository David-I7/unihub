Status: ready-for-agent

# Compatible Material linking and inline Material toggles

## Parent

.scratch/contribution-suggestion-flow-reset/PRD.md

## What to build

Ensure Assignment Deadline and Exam forms link existing Materials through compatible Material multiselects, and keep inline new Material creation hidden until explicitly toggled. Assignment Deadline forms should list assignment Materials only; Exam forms should list exam Materials only. Hidden inline Material fields must not affect generated payloads.

## Acceptance criteria

- [ ] Maintainer Assignment Deadline Contribution forms list only assignment Materials in the linked Material multiselect.
- [ ] Maintainer Exam Contribution forms list only exam Materials in the linked Material multiselect.
- [ ] Student Assignment Deadline Suggestion forms list only assignment Materials in the linked Material multiselect.
- [ ] Student Exam Suggestion forms list only exam Materials in the linked Material multiselect.
- [ ] Compatible Material multiselects support selecting and unselecting multiple Materials.
- [ ] Forms show a useful empty state when no compatible Materials exist.
- [ ] New assignment Material fields are hidden until explicitly toggled open.
- [ ] New exam Material fields are hidden until explicitly toggled open.
- [ ] Hidden inline Material creation fields do not contribute payload fields.
- [ ] Existing validation still rejects Assignment Deadline references to non-assignment Materials.
- [ ] Existing validation still rejects Exam references to non-exam Materials.
- [ ] Domain and UI tests cover compatible filtering, payload generation, and toggle behavior.
- [ ] The repository test suite and production build pass.

## Blocked by

- .scratch/contribution-suggestion-flow-reset/issues/01-issue-only-contribution-contract.md
