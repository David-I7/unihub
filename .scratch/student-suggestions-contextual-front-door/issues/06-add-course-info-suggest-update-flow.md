Status: ready-for-agent

# Add course info Suggest update flow

## Parent

.scratch/student-suggestions-contextual-front-door/PRD.md

## What to build

Add a student-facing Suggestion flow from the Course header for course-level information changes. Students should be able to suggest corrections to course title, professors, or description, review a human-readable summary, and continue to a prefilled GitHub issue with maintainer-facing Contribution details.

## Acceptance criteria

- [ ] The Course header exposes a section-level `Suggest update` action for course information.
- [ ] The flow supports suggesting changes to title, professors, and description.
- [ ] Course information corrections require a note/source.
- [ ] Course information Suggestions map to existing generated Contribution behavior where possible.
- [ ] The student review step uses plain-language course info wording and does not show JSON or raw Contribution type names.
- [ ] The GitHub issue body includes a student-facing summary and a secondary generated Contribution section for maintainers.
- [ ] Tests cover course info Suggestion validation, summary output, and generated GitHub issue content.

## Blocked by

- .scratch/student-suggestions-contextual-front-door/issues/01-add-suggestion-domain-adapter-for-material-suggestions.md
- .scratch/student-suggestions-contextual-front-door/issues/02-expose-materials-suggest-update-flow-on-course-pages.md
