# Contribution Pull Request Assist Flow

Status: ready-for-human

## Parent

.scratch/unihub-course-platform/PRD.md

## What to build

Extend the Contribute page with assisted pull request mode. Users should be able to choose the same one-change Contribution flow, validate it, and receive the target Course Path, updated JSON or JSON snippet, suggested pull request title, suggested pull request body, and GitHub edit/create link where possible.

This flow should assist contributors without requiring the static app to create pull requests directly.

## Acceptance criteria

- [ ] Contribute page lets users choose pull request assist mode as an alternative to GitHub issue mode.
- [ ] Pull request assist mode uses the same Contribution types and target selection rules as issue mode.
- [ ] Pull request assist mode uses the shared Contribution validation core.
- [ ] Blocking validation errors prevent pull request instructions from being generated.
- [ ] Allowed warnings are shown and included in the generated pull request body.
- [ ] Generated output includes target Course Path, updated JSON or JSON snippet, suggested PR title, and suggested PR body.
- [ ] GitHub edit or create links are provided where possible.
- [ ] The UI makes clear that one-click pull request creation is not supported by the static app.
- [ ] Tests verify mode selection, validation behavior, generated PR content, warning preservation, and available GitHub links.

## Blocked by

- .scratch/unihub-course-platform/issues/01-static-course-data-foundation.md
- .scratch/unihub-course-platform/issues/02-teams-like-app-shell-and-context-selection.md
- .scratch/unihub-course-platform/issues/06-contribution-validation-core.md
- .scratch/unihub-course-platform/issues/07-contribution-issue-flow.md
