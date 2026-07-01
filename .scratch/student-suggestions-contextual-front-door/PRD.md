Status: ready-for-agent

# PRD: Student Suggestions as Contextual Front Door

## Problem Statement

UniHub's current contribution flow is repository-first. A student who only wants to fix a missing material, changed deadline, cancelled lecture, or exam detail must start from the `Contribute` page, choose a GitHub mode, choose an internal Contribution type, select repository context, and then review generated JSON or GitHub content. That flow is appropriate for maintainers and advanced contributors, but it is too technical for normal students who think in terms of course information, not repository changes.

The current UI also blurs two different audiences. `Contribution` is the correct maintainer-facing domain concept for a proposed repository change, but students need a simpler student-facing `Suggestion` flow that starts where the problem is visible: the Course detail page.

## Solution

Introduce contextual student-facing `Suggestion` actions on Course detail pages while keeping the existing `Contribution` system as the maintainer-reviewed repository change mechanism. Students start from the relevant course section, choose a plain-language suggestion intent, fill a focused form, review a human-readable summary, and then continue through a short GitHub handoff to submit a prefilled issue for maintainer review.

The `Contribute` page remains visible in main navigation, but it is reframed as a maintainer and advanced contribution surface. It should explain at the top that normal students fixing a specific course item should start from the course page and use `Suggest update`. The advanced page keeps GitHub issue and pull request assist modes and defaults to GitHub issue.

Student suggestions do not show raw JSON, repository target paths, pull request bodies, or internal Contribution type names in the normal flow. The app may still generate contribution payloads, target paths, validation details, and GitHub issue content internally. GitHub issues created from the student suggestion flow use student-facing titles and summaries first, followed by a generated contribution section for maintainers.

## User Stories

1. As a student, I want to suggest a course update from the Course detail page, so that I do not have to understand repository contribution mechanics.
2. As a student, I want to suggest a course info update from the course header, so that I can correct course-level details such as title, professors, or description.
3. As a student, I want to suggest a material update from the Materials tab, so that I can add or correct learning resources where I notice the problem.
4. As a student, I want to suggest an assignment update from the Assignments tab, so that I can add or correct assignment information in context.
5. As a student, I want to suggest a lecture update from the Lectures tab, so that I can report missing, changed, or cancelled lectures in context.
6. As a student, I want to suggest an exam update from the Exams tab, so that I can report exam details without using repository terminology.
7. As a student, I want the Materials suggestion flow to ask whether I am adding missing material, fixing existing material, or reporting a broken link, so that the form matches my intent.
8. As a student, I want the Assignments suggestion flow to ask whether I am adding a missing assignment, fixing assignment details, or reporting a changed deadline, so that I only fill relevant fields.
9. As a student, I want the Lectures suggestion flow to ask whether I am adding a missing lecture, fixing lecture details, reporting cancellation, or reporting changed time/location, so that common lecture changes are easy to express.
10. As a student, I want the Exams suggestion flow to ask whether I am adding a missing exam, fixing exam details, reporting changed exam date/location, or reporting that the exam date is not announced, so that uncertain exam information can be represented.
11. As a student, I want suggestion intent labels to use plain language, so that I do not see internal names like `add-material` or `update-material`.
12. As a student, I want simple additions to keep note/source optional, so that adding a missing material or item does not feel unnecessarily heavy.
13. As a student, I want corrections to existing information to require a note or source, so that maintainers understand why canonical information should change.
14. As a maintainer, I want corrections to existing information to include a note or source, so that I can review the suggestion with enough context.
15. As a student, I want the suggestion review step to show a human-readable summary, so that I can verify what I am about to send without reading JSON.
16. As a student, I want the suggestion review step to say that the suggestion will be sent for maintainer review, so that I understand it does not directly change UniHub.
17. As a student, I want the app to explain the GitHub handoff before leaving UniHub, so that opening GitHub is not surprising.
18. As a student, I want the GitHub handoff to say that I can review the prefilled issue before submitting it, so that I stay in control of what is posted.
19. As a student, I want the handoff action to be clearly labeled `Continue to GitHub`, so that I know the next step leaves the app.
20. As a student, I want GitHub issues created from suggestions to use student-facing titles, so that the public issue reflects what I meant.
21. As a student, I want GitHub issues created from suggestions to lead with the plain-language suggestion summary, so that I can understand the issue before submitting it.
22. As a maintainer, I want GitHub issues created from suggestions to include generated contribution details, so that I can apply or validate the repository change efficiently.
23. As a maintainer, I want generated contribution details to include the internal Contribution type and target repository path, so that I can review the actual data change.
24. As a maintainer, I want the existing Contribution validation rules to remain in force for student suggestions, so that suggestions cannot generate invalid course data.
25. As a maintainer, I want student suggestions to map onto the existing generated Contribution behavior where possible, so that the new flow does not duplicate data mutation logic.
26. As a contributor, I want the advanced `Contribute` page to remain available, so that repository-level and power-user contribution workflows are not removed.
27. As a maintainer, I want the advanced `Contribute` page to explain that it is for repository-level course data changes, advanced corrections, and preparing GitHub issues or pull requests, so that users choose the right entry point.
28. As a student who lands on the `Contribute` page directly, I want the top copy to tell me to start from the Course page for specific course item fixes, so that I can recover from the wrong entry point.
29. As an advanced contributor, I want the `Contribute` page to keep GitHub issue mode, so that I can submit a maintainer-reviewed change without preparing a pull request.
30. As an advanced contributor, I want the `Contribute` page to keep pull request assist mode, so that I can prepare a repository edit when I am confident doing so.
31. As a student or semi-technical contributor, I want the advanced `Contribute` page to default to GitHub issue mode, so that the safer review path is selected by default.
32. As a student, I do not want UniHub to imply that it tracks suggestion status in-app, so that I know to follow GitHub after submitting.
33. As a maintainer, I want GitHub to remain the v1 review and status surface, so that the static app does not require accounts, GitHub API integration, or a new backend.
34. As a student, I want the canonical generated GitHub links to target the real UniHub repository, so that my suggestion goes to the correct maintainers.
35. As a maintainer, I want the student-facing `Suggestion` concept to remain distinct from the maintainer-facing `Contribution` concept, so that the code and UI can serve both audiences clearly.

## Implementation Decisions

- Preserve `Contribution` as the internal maintainer-reviewed repository change model.
- Use `Suggestion` as the student-facing concept for requests to add or correct course information.
- Respect ADR 0008: contextual course-page suggestions are the normal student front door; the advanced `Contribute` page remains visible for maintainers and advanced contributors.
- Add section-level `Suggest update` entry points to Course detail pages:
  - Course header: suggest course info update.
  - Materials tab: suggest material update.
  - Assignments tab: suggest assignment update.
  - Lectures tab: suggest lecture update.
  - Exams tab: suggest exam update.
- Do not add per-item suggestion buttons in the first version. Section-level actions are the first slice; per-item actions can be added later.
- Introduce a student-facing suggestion flow that captures:
  - The selected Course.
  - The Course section.
  - The student-facing suggestion intent.
  - Intent-specific fields.
  - Optional or required note/source depending on risk.
- Materials suggestion intents:
  - Add missing material.
  - Fix an existing material.
  - Report a broken link.
- Assignments suggestion intents:
  - Add missing assignment.
  - Fix assignment details.
  - Report changed deadline.
- Lectures suggestion intents:
  - Add missing lecture.
  - Fix lecture details.
  - Report cancellation.
  - Report changed time/location.
- Exams suggestion intents:
  - Add missing exam.
  - Fix exam details.
  - Report changed exam date/location.
  - Report exam date not announced.
- Corrections to existing canonical information require a note or source.
- Simple additions may keep note/source optional.
- Student-facing suggestion review shows only a human-readable summary.
- Student-facing suggestion review must not show raw JSON, repository target paths, pull request bodies, or raw Contribution type names.
- The app may internally generate Contribution payloads, target paths, validation details, and GitHub issue content.
- Existing generated Contribution behavior should be reused through a thin student-facing adapter rather than duplicating course data mutation logic.
- The preferred test seam is the highest-level suggestion-to-GitHub-output behavior: given a Course, suggestion intent, and input, the system produces validation results, a student-facing summary, a GitHub handoff target, and maintainer-facing generated contribution details.
- The GitHub handoff copy is:

```text
UniHub uses GitHub for maintainer review.

We will open a prefilled issue with your suggestion. You can review it on GitHub before submitting.
```

- The handoff action label is:

```text
Continue to GitHub
```

- After GitHub handoff, GitHub is the review and status surface for v1.
- The handoff or confirmation copy should include:

```text
After submitting on GitHub, maintainers will review your suggestion there.
```

- GitHub issue titles created from student suggestions use student-facing wording, such as:

```text
Suggestion: Add material to Algorithms
```

- GitHub issue bodies created from student suggestions lead with a student-facing summary and include a secondary generated contribution section for maintainers.
- Generated links target the canonical repository:

```text
https://github.com/David-I7/unihub
```

- The advanced `Contribute` page remains visible in the main navigation.
- The top of the advanced `Contribute` page should say:

```text
Maintainer contributions

Use this page for repository-level course data changes, advanced corrections, and preparing GitHub issues or pull requests for maintainer review. If you are a student fixing a specific course item, start from that course page and use Suggest update.
```

- The advanced `Contribute` page keeps GitHub issue and pull request assist modes.
- The advanced `Contribute` page defaults to GitHub issue mode.

## Testing Decisions

- Tests should cover external behavior rather than component internals.
- The primary domain test seam should verify suggestion-to-contribution mapping and generated GitHub issue output.
- Tests should assert that student-facing suggestion output uses plain-language labels and does not expose raw Contribution type names as the primary content.
- Tests should assert that maintainer-facing generated contribution details are still present in GitHub issue bodies.
- Tests should assert that corrections to existing information require a note/source, while simple additions can proceed without one.
- Tests should assert that invalid suggestion inputs are blocked through existing Contribution validation behavior.
- Tests should assert that generated GitHub links target `David-I7/unihub`.
- UI tests, if added, should verify the visible flow at the Course detail level: section action, intent choice, focused form, human-readable summary, GitHub handoff.
- Existing domain tests around generated Contributions, validation, repository paths, and GitHub link generation are the closest prior art.
- Existing browser screenshot checks for course and contribution pages are useful prior art for layout verification if this becomes a UI implementation task.

## Out of Scope

- In-app suggestion status tracking.
- Personal submission history.
- Suggestion inbox inside UniHub.
- Accounts or login.
- GitHub API integration.
- Direct in-app writes to the repository.
- Authenticated trusted editor roles.
- One-click pull request creation.
- Hiding or removing the advanced `Contribute` page.
- Replacing the existing Contribution model.
- Showing raw JSON in the normal student suggestion flow.
- Adding per-item suggestion buttons in the first version.
- Bulk repository changes through the student suggestion flow.
- Changing canonical course data schemas beyond what is required to generate existing Contribution payloads.

## Further Notes

The domain glossary now distinguishes `Suggestion` from `Contribution`: a Suggestion is the student-facing request, while a Contribution is the maintainer-reviewed repository change. This PRD follows that split.

The product documentation and ADR record the chosen direction. The implementation should keep student-facing copy course-first and maintain the current static GitHub-native review constraint.
