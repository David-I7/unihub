Status: ready-for-agent

# Extend Suggestion flow to exams

## Parent

.scratch/student-suggestions-contextual-front-door/PRD.md

## What to build

Extend the student-facing Suggestion adapter and Course page UI to support Exams. Students should be able to suggest exam changes from the Exams section using plain-language intents, review a human-readable summary, and continue to a prefilled GitHub issue with maintainer-facing Contribution details.

Exam intents:

- Add missing exam
- Fix exam details
- Report changed exam date/location
- Report exam date not announced

## Acceptance criteria

- [ ] The Exams section exposes a section-level `Suggest update` action.
- [ ] The flow supports adding a missing exam, fixing exam details, reporting changed exam date/location, and reporting that the exam date is not announced.
- [ ] Exam correction intents require a note/source.
- [ ] Simple missing exam suggestions may keep note/source optional.
- [ ] Exam Suggestions map to existing generated Contribution behavior where possible.
- [ ] The student review step uses plain-language exam wording and does not show JSON or raw Contribution type names.
- [ ] The GitHub issue body includes a student-facing summary and a secondary generated Contribution section for maintainers.
- [ ] Tests cover exam Suggestion validation, summary output, and generated GitHub issue content.

## Blocked by

- .scratch/student-suggestions-contextual-front-door/issues/01-add-suggestion-domain-adapter-for-material-suggestions.md
- .scratch/student-suggestions-contextual-front-door/issues/02-expose-materials-suggest-update-flow-on-course-pages.md
