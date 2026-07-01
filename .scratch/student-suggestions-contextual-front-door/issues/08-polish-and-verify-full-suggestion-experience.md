Status: ready-for-agent

# Polish and verify full suggestion experience

## Parent

.scratch/student-suggestions-contextual-front-door/PRD.md

## What to build

Perform a final cross-flow verification pass over the completed Suggestion experience. The full experience should be consistent across course info, Materials, Assignments, Lectures, and Exams: plain-language student copy, no JSON in student review, clear GitHub handoff, correct status expectations, and responsive layout.

## Acceptance criteria

- [ ] All section-level Suggestion flows use consistent student-facing language.
- [ ] No normal student Suggestion review step exposes raw JSON, repository target paths, pull request bodies, or raw Contribution type names.
- [ ] All GitHub handoff steps use the agreed copy and `Continue to GitHub` action.
- [ ] All flows communicate that maintainers review suggestions on GitHub after submission.
- [ ] All generated GitHub issue links target `David-I7/unihub`.
- [ ] Maintainer-facing generated Contribution details remain present in generated GitHub issue bodies.
- [ ] The Course page Suggestion actions and flows are responsive on mobile and desktop.
- [ ] The advanced `Contribute` page remains usable after the student Suggestion flow is added.
- [ ] Automated tests and/or browser verification cover the complete suggestion experience.

## Blocked by

- .scratch/student-suggestions-contextual-front-door/issues/02-expose-materials-suggest-update-flow-on-course-pages.md
- .scratch/student-suggestions-contextual-front-door/issues/03-extend-suggestion-flow-to-assignments.md
- .scratch/student-suggestions-contextual-front-door/issues/04-extend-suggestion-flow-to-lectures.md
- .scratch/student-suggestions-contextual-front-door/issues/05-extend-suggestion-flow-to-exams.md
- .scratch/student-suggestions-contextual-front-door/issues/06-add-course-info-suggest-update-flow.md
- .scratch/student-suggestions-contextual-front-door/issues/07-reframe-the-advanced-contribute-page.md
