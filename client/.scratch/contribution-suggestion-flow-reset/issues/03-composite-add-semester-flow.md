Status: ready-for-agent

# Composite Add Semester flow

## Parent

.scratch/contribution-suggestion-flow-reset/PRD.md

## What to build

Make Add Semester the only visible catalog-structure task in the maintainer Contribution flow. Add Semester should support creating a new Academic Year and/or Study Year in the same Contribution when those sections are explicitly toggled open. Catalog entry forms should be label-first, with generated IDs updating from labels until the maintainer manually edits an ID field.

## Acceptance criteria

- [ ] Maintainer Contribution task options do not expose standalone Add Academic Year or Add Study Year.
- [ ] Add Semester is the only visible catalog-structure task.
- [ ] Add Semester can create a Semester under existing Academic Year and Study Year parents.
- [ ] Add Semester can create a new Academic Year and then the Semester in one Contribution.
- [ ] Add Semester can create a new Study Year and then the Semester in one Contribution.
- [ ] Add Semester can create both a new Academic Year and a new Study Year before creating the Semester.
- [ ] New Academic Year and new Study Year sections are hidden until explicitly toggled open.
- [ ] Hidden parent creation sections do not emit parent payload fields.
- [ ] Generated ID fields update from labels until manually edited.
- [ ] Manually edited generated IDs are not overwritten by later label changes.
- [ ] Duplicate and missing hierarchy cases fail validation with user-facing messages.
- [ ] Domain and UI tests cover composite catalog behavior and label-first ID behavior.
- [ ] The repository test suite and production build pass.

## Blocked by

- .scratch/contribution-suggestion-flow-reset/issues/01-issue-only-contribution-contract.md
