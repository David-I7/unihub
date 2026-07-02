Status: ready-for-agent

# Singular student Suggestion guardrails

## Parent

.scratch/contribution-suggestion-flow-reset/PRD.md

## What to build

Keep student-facing Suggestion flows singular and plain-language. Suggestions should create exactly one item, never expose add-another controls, and defensively reject array input even if the UI does not submit arrays. Suggestion summaries should remain student-facing while generated GitHub issues include maintainer Contribution details.

## Acceptance criteria

- [ ] Student Suggestion flows create exactly one item.
- [ ] Student Suggestion forms do not expose add-another controls.
- [ ] Suggestion domain handling rejects array input defensively.
- [ ] Suggestion review summaries remain human-readable.
- [ ] Suggestion review summaries do not expose raw Contribution type names.
- [ ] Suggestion review summaries do not expose repository target paths.
- [ ] Suggestion flows do not expose pull request concepts.
- [ ] Suggestion GitHub issue bodies still include generated Contribution details for maintainers.
- [ ] Domain and UI tests cover singular Suggestion behavior and defensive array rejection.
- [ ] The repository test suite and production build pass.

## Blocked by

- .scratch/contribution-suggestion-flow-reset/issues/01-issue-only-contribution-contract.md
- .scratch/contribution-suggestion-flow-reset/issues/04-compatible-material-linking-and-inline-material-toggles.md
