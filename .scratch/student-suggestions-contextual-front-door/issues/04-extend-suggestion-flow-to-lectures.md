Status: ready-for-agent

# Extend Suggestion flow to lectures

## Parent

.scratch/student-suggestions-contextual-front-door/PRD.md

## What to build

Extend the student-facing Suggestion adapter and Course page UI to support Lectures. Students should be able to suggest lecture changes from the Lectures section using plain-language intents, review a human-readable summary, and continue to a prefilled GitHub issue with maintainer-facing Contribution details.

Lecture intents:

- Add missing lecture
- Fix lecture details
- Report cancellation
- Report changed time/location

## Acceptance criteria

- [ ] The Lectures section exposes a section-level `Suggest update` action.
- [ ] The flow supports adding a missing lecture, fixing lecture details, reporting cancellation, and reporting changed time/location.
- [ ] Lecture correction intents require a note/source.
- [ ] Simple missing lecture suggestions may keep note/source optional.
- [ ] Lecture Suggestions map to existing generated Contribution behavior where possible.
- [ ] The student review step uses plain-language lecture wording and does not show JSON or raw Contribution type names.
- [ ] The GitHub issue body includes a student-facing summary and a secondary generated Contribution section for maintainers.
- [ ] Tests cover lecture Suggestion validation, summary output, and generated GitHub issue content.

## Blocked by

- .scratch/student-suggestions-contextual-front-door/issues/01-add-suggestion-domain-adapter-for-material-suggestions.md
- .scratch/student-suggestions-contextual-front-door/issues/02-expose-materials-suggest-update-flow-on-course-pages.md
