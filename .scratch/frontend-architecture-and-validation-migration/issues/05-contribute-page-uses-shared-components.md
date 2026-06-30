Status: ready-for-agent

# Contribute Page Uses Shared Components

## Parent

.scratch/frontend-architecture-and-validation-migration/PRD.md

## What to build

Move the Contribute route behavior into a route-level page that consumes the shared academic context and loaded Course data. Replace bespoke controls, inline styles, and schema-guide markup with Tailwind, shadcn primitives, and lucide icons while preserving the maintainer-reviewed Contribution workflow.

## Acceptance criteria

- [ ] The Contribute page still supports issue mode and pull request assist mode.
- [ ] Contribution type selection still updates the sample payload.
- [ ] Existing Course selection still follows the selected Academic Year, Study Year, and Semester.
- [ ] Add-new-Course Contributions still target a new Course Path without requiring an existing Course.
- [ ] Invalid Contribution payloads still block output generation and show actionable validation errors.
- [ ] Valid Contribution payloads still generate prefilled GitHub issue content in issue mode.
- [ ] Valid Contribution payloads still generate pull request assist content in pull request assist mode.
- [ ] The schema guide remains available as a dialog with a readable table of expected fields.
- [ ] Buttons, selects, textarea, dialog, table, badges, and action icons use shadcn/lucide where they directly match the current interface.
- [ ] `npm run lint`, `npm test`, and `npm run build` pass.

## Blocked by

- .scratch/frontend-architecture-and-validation-migration/issues/02-app-layout-owns-academic-context.md
