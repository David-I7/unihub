Status: completed

# Canonicalize public Catalog and Course data paths

## Parent

.scratch/course-data-domain-fixes/PRD.md

## What to build

Make `public/data` the only canonical source for Catalog and Course JSON across repository loading, validation, generated Contribution output, and GitHub edit links. The app should no longer depend on a duplicated compile-time Catalog source, and generated Course file paths should point contributors and maintainers at the public Course data files.

## Acceptance criteria

- [x] Repository loading reads Catalog and Course data from the canonical public data source in local checks/tests.
- [x] Browser Course loading continues fetching public Course JSON for the selected Academic Year, Study Year, and Semester.
- [x] Generated Contribution target paths and pull request assist links point at canonical public Course files.
- [x] Stale `src/data` data-source assumptions are removed from active code and test configuration.
- [x] Course Path parsing still accepts repository paths that include the `courses` hierarchy.
- [x] Existing Catalog hierarchy, Course Path consistency, and repository validation behavior remain covered by tests.

## Blocked by

None - can start immediately
