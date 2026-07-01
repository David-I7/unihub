Status: ready-for-human

## Parent

.scratch/contribution-view-toggle/PRD.md

## What to build

Update the domain layer contribution review output to:
1. Support return of the specific added/modified payload (the `parsed` field) for catalog contribution types.
2. Format the prefilled GitHub Issue and copied Pull Request body content to exclude the `Validation warnings:` section completely.

Additionally, update the domain test suite to cover the clean format of the output strings and confirm the schema validation continues to pass.

## Acceptance criteria

- [ ] Catalog contribution generators return the specific added item in their `parsed` payload field.
- [ ] Both Course and Catalog generated issue/PR body content exclude the validation warnings.
- [ ] Prefilled issue URL and copied PR content include the full updated JSON document without warning text.
- [ ] Domain test suite passes and verifies warning removal from `issueBody` / `prBody`.

## Blocked by

None - can start immediately
