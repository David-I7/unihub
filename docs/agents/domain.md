# Domain Docs

How the engineering skills should consume this repo's domain documentation when exploring the codebase.

## Layout

This repo uses a single-context domain-doc layout:

- `CONTEXT.md` at the repo root for project vocabulary and domain language
- `docs/adr/` at the repo root for architecture decision records

## Before exploring, read these

- `CONTEXT.md` at the repo root, if it exists
- ADRs under `docs/adr/` that touch the area about to be worked on, if they exist

If any of these files do not exist, proceed silently. Do not flag their absence or suggest creating them upfront. The `domain-modeling` skill, reached via `grill-with-docs` and `improve-codebase-architecture`, creates them lazily when terms or decisions actually get resolved.

## Use the glossary's vocabulary

When output names a domain concept in an issue title, refactor proposal, hypothesis, or test name, use the term as defined in `CONTEXT.md`. Do not drift to synonyms the glossary explicitly avoids.

If the concept is not in the glossary yet, that is a signal: either the output is inventing language the project does not use, or there is a real gap to note for `domain-modeling`.

## Flag ADR conflicts

If output contradicts an existing ADR, surface it explicitly rather than silently overriding it.
