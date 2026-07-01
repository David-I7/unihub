# Clipboard And GitHub Assist Polish

Status: ready-for-agent

## Parent

.scratch/simplified-course-contribution-flow/PRD.md

## What to build

Harden the GitHub handoff behavior for task-shaped Contributions. Issue mode should place generated JSON and validation context directly into the prefilled GitHub issue body. Pull request assist mode should copy generated JSON and PR text to the clipboard, show the target path, and provide a GitHub edit/create link when possible. Clipboard failure should be recoverable without bringing back a primary JSON editor.

This slice focuses on the final handoff experience after task flows generate valid Contributions.

## Acceptance criteria

- [ ] Issue mode prefilled GitHub URLs include Contribution type, target path, generated JSON, validation result, and warnings.
- [ ] Pull request assist mode exposes the target file path.
- [ ] Pull request assist mode copies generated JSON and PR body content to the clipboard when supported.
- [ ] Pull request assist mode provides a GitHub edit/create link when possible.
- [ ] Clipboard failure is handled with clear recovery behavior that does not reintroduce the raw JSON editor as the normal flow.
- [ ] The generated issue and PR content remains reviewer-friendly and includes enough context for maintainers to apply the change.
- [ ] Tests cover issue URL content, PR assist content, clipboard success, and clipboard failure.
- [ ] Existing Contribution preparation behavior remains compatible with static, unauthenticated deployment.

## Blocked by

- .scratch/simplified-course-contribution-flow/issues/03-build-add-new-course-task-flow.md
- .scratch/simplified-course-contribution-flow/issues/04-build-material-task-flows.md
- .scratch/simplified-course-contribution-flow/issues/05-build-assignment-deadline-task-flow.md
- .scratch/simplified-course-contribution-flow/issues/06-build-exam-task-flow.md
- .scratch/simplified-course-contribution-flow/issues/07-build-course-session-and-course-metadata-task-flows.md
