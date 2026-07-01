Status: ready-for-agent

# Expose Materials Suggest update flow on Course pages

## Parent

.scratch/student-suggestions-contextual-front-door/PRD.md

## What to build

Add the first visible student Suggestion flow to Course detail pages through the Materials section. A student should be able to start from a Course page, choose a material suggestion intent, fill a focused form, review a human-readable summary, see the GitHub handoff copy, and continue to the generated GitHub issue.

This is the first UI tracer bullet for the contextual Suggestion experience.

## Acceptance criteria

- [ ] The Materials section exposes a section-level `Suggest update` action.
- [ ] The flow lets the student choose between adding missing material, fixing existing material, and reporting a broken link.
- [ ] The form fields are focused on the selected material intent.
- [ ] The review step shows a human-readable summary only.
- [ ] The review step does not show raw JSON, repository target paths, pull request bodies, or raw Contribution type names.
- [ ] The handoff step uses the agreed GitHub review copy and a `Continue to GitHub` action.
- [ ] The GitHub issue link opens a prefilled issue based on the material Suggestion.
- [ ] The UI communicates that maintainers will review the suggestion on GitHub after submission.
- [ ] Tests or browser verification cover the visible Materials Suggestion path.

## Blocked by

- .scratch/student-suggestions-contextual-front-door/issues/01-add-suggestion-domain-adapter-for-material-suggestions.md
