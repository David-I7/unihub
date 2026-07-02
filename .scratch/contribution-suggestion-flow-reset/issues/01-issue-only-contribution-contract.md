Status: ready-for-agent

# Issue-only Contribution contract

## Parent

.scratch/contribution-suggestion-flow-reset/PRD.md

## What to build

Remove pull request assist from the maintainer Contribution flow end to end. Contribution preparation should expose GitHub issue handoff output only, and the Contribute page should no longer show a mode selector, pull request copy actions, PR body output, or GitHub edit/create links. Generated issue bodies remain the maintainer review artifact.

## Acceptance criteria

- [ ] Contribution preparation has an issue-only public contract.
- [ ] Prepared Contribution output no longer exposes PR title, PR body, or GitHub edit/create link fields.
- [ ] The Contribute page no longer renders a Contribution mode selector.
- [ ] The Contribute page no longer renders pull request assist panels, copy actions, or GitHub edit/create links.
- [ ] Generated GitHub issue URLs remain short and do not embed the full issue body.
- [ ] Generated GitHub issue bodies still include review-focused diff and new-state content.
- [ ] Tests assert issue-only Contribution output and absence of PR output fields.
- [ ] The repository test suite and production build pass.

## Blocked by

None - can start immediately.
