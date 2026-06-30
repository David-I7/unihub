Status: completed

# Supersede stale backlog assumptions

## Parent

.scratch/course-data-domain-fixes/PRD.md

## What to build

Update or clearly supersede older local tracker notes that contradict the current Course data domain decisions. Future agents should not be guided by stale statements that Catalog data is duplicated in `src/data`, Activity excludes updates, or Grade Weight totals above 100 are invalid.

## Acceptance criteria

- [x] Stale tracker notes about duplicated `src/data` Catalog data are updated or marked superseded.
- [x] Stale tracker notes about Activity representing only newly inserted items are updated or marked superseded.
- [x] Stale tracker notes about Grade Weight totals above 100 being invalid are updated or marked superseded.
- [x] Updates reference the current Course data domain fixes PRD or the relevant new issue where useful.
- [x] No parent PRD or issue is closed as part of this cleanup.

## Blocked by

- .scratch/course-data-domain-fixes/issues/01-canonicalize-public-catalog-and-course-data-paths.md
- .scratch/course-data-domain-fixes/issues/03-show-material-updates-in-activity.md
- .scratch/course-data-domain-fixes/issues/05-allow-grade-weight-totals-above-100.md
