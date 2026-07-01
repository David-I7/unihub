Status: ready-for-human

## Parent

.scratch/contribution-view-toggle/PRD.md

## What to build

Introduce a state-backed preview toggle on the Contribute page code section. The default view must be the "Diff" view, displaying just the specific contribution changes formatted as JSON. The user must be able to click a tab/button to toggle to the "Full JSON" view, displaying the complete updated Course or Catalog JSON.

## Acceptance criteria

- [ ] A clean tab/button toggle is rendered in the preview section of both Issue and Pull Request modes.
- [ ] The default view is "Diff" for all contribution types.
- [ ] In "Diff" view, the code block displays `JSON.stringify(result.parsed, null, 2)`.
- [ ] In "Full JSON" view, the code block displays the complete updated JSON (`result.changedJson`).
- [ ] Prefilled issue creation URLs and clipboard copied PR content continue to use the full updated JSON, regardless of the active UI preview selection.

## Blocked by

- .scratch/contribution-view-toggle/issues/01-exclude-warnings-and-implement-catalog-diffs.md
