Status: ready-for-agent

# Contribution validation copy and UI verification

## Parent

.scratch/contribution-suggestion-flow-reset/PRD.md

## What to build

Finish the user-facing validation and verification pass for the reset Contribution and Suggestion flows. The validation panel should use friendlier copy, and the implemented UI should be verified for issue-only handoff, hidden toggles, generated ID behavior, compatible Material multiselects, add-another controls, and singular Suggestions.

## Acceptance criteria

- [ ] Validation error title says Failed to validate.
- [ ] The Contribution page has no mode selector, PR copy button, PR output panel, or GitHub edit/create link.
- [ ] UI verification covers hidden new Academic Year and Study Year toggles.
- [ ] UI verification covers generated ID live updates and manual override behavior.
- [ ] UI verification covers compatible Material multiselect select/unselect behavior.
- [ ] UI verification covers inline new Material toggles.
- [ ] UI verification covers working Add another controls for each batchable maintainer task.
- [ ] UI verification covers absence of add-another controls in student Suggestions.
- [ ] Tests verify user-visible behavior and public contracts rather than private helper names.
- [ ] The repository test suite and production build pass.

## Blocked by

- .scratch/contribution-suggestion-flow-reset/issues/02-new-course-professor-requirement.md
- .scratch/contribution-suggestion-flow-reset/issues/03-composite-add-semester-flow.md
- .scratch/contribution-suggestion-flow-reset/issues/04-compatible-material-linking-and-inline-material-toggles.md
- .scratch/contribution-suggestion-flow-reset/issues/05-maintainer-batch-contribution-items.md
- .scratch/contribution-suggestion-flow-reset/issues/06-singular-student-suggestion-guardrails.md
