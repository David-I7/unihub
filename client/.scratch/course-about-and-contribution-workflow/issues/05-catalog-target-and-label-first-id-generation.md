Status: ready-for-agent

# Catalog target and label-first ID generation

## Parent

.scratch/course-about-and-contribution-workflow/PRD.md

## What to build

Fix Catalog-structure Contribution targeting and authoring. The maintainer UI should expose Add Semester as the single catalog-structure authoring flow: standalone Add Academic Year and Add Study Year tasks are removed from the UI, while their domain handlers may remain for backward compatibility. Add Semester can optionally create a new Academic Year and/or Study Year in the same Contribution when the maintainer explicitly toggles those sections open. New Course creation requires Academic Year, Study Year, and Semester targets. Catalog entry forms are label-first: users type the label, the UI derives and displays the generated ID, and advanced maintainer flows may override the ID when necessary.

## Acceptance criteria

- [ ] Contribution task options do not expose standalone Add Academic Year or Add Study Year tasks.
- [ ] Add Semester is the only visible catalog-structure task in the maintainer UI.
- [ ] Add Semester can optionally create a new Academic Year when the maintainer toggles that section open.
- [ ] Add Semester can optionally create a new Study Year when the maintainer toggles that section open.
- [ ] Hidden new Academic Year and Study Year sections do not contribute payload fields until toggled.
- [ ] Add Study Year UI treats Academic Year ID as required if the backward-compatible standalone flow is still reachable outside the maintainer UI.
- [ ] Add Study Year validation rejects missing Academic Year ID.
- [ ] Add Semester UI treats Academic Year ID and Study Year ID as required.
- [ ] Add Semester validation rejects missing Academic Year ID or Study Year ID.
- [ ] Add new Course UI treats Academic Year ID, Study Year ID, and Semester ID as required.
- [ ] Add new Course validation rejects missing Academic Year ID, Study Year ID, or Semester ID.
- [ ] Catalog creation forms default to label-first entry.
- [ ] IDs are derived deterministically from labels and displayed as generated secondary values.
- [ ] Generated ID fields update live from the label until the maintainer manually edits the ID field.
- [ ] Once a maintainer manually edits a generated ID field, later label edits do not overwrite that field.
- [ ] Advanced maintainer override remains possible where needed.
- [ ] Tests cover required hierarchy targets, label-to-ID derivation, and generated payload behavior.
- [ ] The repository test suite and production build pass.

## Blocked by

None - can start immediately.
