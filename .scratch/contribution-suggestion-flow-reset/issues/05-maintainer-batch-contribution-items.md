Status: ready-for-agent

# Maintainer batch Contribution items

## Parent

.scratch/contribution-suggestion-flow-reset/PRD.md

## What to build

Make repeated Course item creation work as explicit maintainer batches. Add another controls for Materials, Assignment Deadlines, Exams, and Course Sessions should append editable items. A batch Contribution should generate one GitHub issue containing all items, while validation uses clean single-item wording for one item and item-specific wording for multiple items.

## Acceptance criteria

- [ ] Add another material appends a new editable Material item.
- [ ] Add another assignment appends a new editable Assignment Deadline item.
- [ ] Add another exam appends a new editable Exam item.
- [ ] Add another lecture appends a new editable Course Session item.
- [ ] Batchable maintainer Contribution tasks use an `items` array in generated input.
- [ ] Non-batchable tasks do not expose add-another controls.
- [ ] Batch Contributions generate one GitHub issue containing all added items.
- [ ] Duplicate IDs inside a batch are blocked.
- [ ] Single-item Contributions use validation wording without item indexes.
- [ ] Multi-item Contributions identify the failing item in validation messages.
- [ ] Domain and UI tests cover batch generation, issue output, duplicate guardrails, and validation wording.
- [ ] The repository test suite and production build pass.

## Blocked by

- .scratch/contribution-suggestion-flow-reset/issues/01-issue-only-contribution-contract.md
- .scratch/contribution-suggestion-flow-reset/issues/04-compatible-material-linking-and-inline-material-toggles.md
