Status: ready-for-agent

# Zod Validation Replaces JSON Schema

Superseded note: `.scratch/course-data-domain-fixes/issues/05-allow-grade-weight-totals-above-100.md` supersedes the Grade Weight hard-cap acceptance criterion below. Zod validation should allow Grade Weight totals above 100.

## Parent

.scratch/frontend-architecture-and-validation-migration/PRD.md

## What to build

Replace the JSON Schema validation implementation with zod schemas for Catalog data, Course data, and Contribution payloads. Preserve the public validation result contract and existing user-facing validation behavior, then remove legacy JSON Schema files once zod parity is covered by tests.

## Acceptance criteria

- [ ] Catalog validation uses zod as the runtime validation source of truth.
- [ ] Course validation uses zod as the runtime validation source of truth.
- [ ] Contribution payload validation uses zod as the runtime validation source of truth.
- [ ] Validation functions still return the existing valid/errors/warnings result shape.
- [ ] Existing friendly error and warning wording is preserved where practical.
- [ ] Course warnings such as missing professors, missing Materials, missing optional timestamps, unknown Exam dates, and incomplete Grade Weight totals remain warnings.
- [ ] Duplicate local IDs, invalid Material References, invalid Session Status, impossible Course Session timing, and Grade Weight totals above 100 remain blocking errors.
- [ ] Contribution validation still supports supported batch types and rejects unsupported batch payloads.
- [ ] Legacy JSON Schema files are removed after equivalent zod schemas and tests are in place.
- [ ] Tests cover Catalog, Course, repository, and Contribution validation parity.
- [ ] `npm run lint`, `npm test`, and `npm run build` pass.

## Blocked by

- .scratch/frontend-architecture-and-validation-migration/issues/01-frontend-migration-foundation.md
