Status: ready-for-agent

# Extend Suggestion flow to assignments

## Parent

.scratch/student-suggestions-contextual-front-door/PRD.md

## What to build

Extend the student-facing Suggestion adapter and Course page UI to support Assignments. Students should be able to suggest assignment changes from the Assignments section using plain-language intents, review a human-readable summary, and continue to a prefilled GitHub issue with maintainer-facing Contribution details.

Assignment intents:

- Add missing assignment
- Fix assignment details
- Report changed deadline

## Acceptance criteria

- [ ] The Assignments section exposes a section-level `Suggest update` action.
- [ ] The flow supports adding a missing assignment, fixing assignment details, and reporting a changed deadline.
- [ ] Assignment correction intents require a note/source.
- [ ] Simple missing assignment suggestions may keep note/source optional.
- [ ] Assignment Suggestions map to existing generated Contribution behavior where possible.
- [ ] The student review step uses plain-language assignment wording and does not show JSON or raw Contribution type names.
- [ ] The GitHub issue body includes a student-facing summary and a secondary generated Contribution section for maintainers.
- [ ] Tests cover assignment Suggestion validation, summary output, and generated GitHub issue content.

## Blocked by

- .scratch/student-suggestions-contextual-front-door/issues/01-add-suggestion-domain-adapter-for-material-suggestions.md
- .scratch/student-suggestions-contextual-front-door/issues/02-expose-materials-suggest-update-flow-on-course-pages.md
