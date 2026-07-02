Status: ready-for-agent

# New Course professor requirement

## Parent

.scratch/contribution-suggestion-flow-reset/PRD.md

## What to build

Make at least one professor a required part of every new Course. Generated New Course Contributions, canonical Course validation, and the maintainer New Course form should agree: a Course with an empty professor list is invalid, and the form should guide maintainers to enter one or more comma-separated professor names.

## Acceptance criteria

- [ ] New Course generation rejects missing or empty professors.
- [ ] Canonical Course validation rejects Course records with an empty professor list.
- [ ] Empty professor lists are validation errors, not warnings.
- [ ] The New Course form labels professors as required.
- [ ] The New Course professor field explains that multiple professors are separated with commas.
- [ ] Generated New Course payloads split comma-separated professor names into an array.
- [ ] New Course generation keeps default `unknown` Material Difficulty and Passing Difficulty values.
- [ ] Domain tests cover generated Contribution validation and canonical Course validation.
- [ ] The repository test suite and production build pass.

## Blocked by

- .scratch/contribution-suggestion-flow-reset/issues/01-issue-only-contribution-contract.md
