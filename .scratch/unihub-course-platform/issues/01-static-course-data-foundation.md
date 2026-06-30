# Static Course Data Foundation

Superseded note: `.scratch/course-data-domain-fixes/PRD.md` supersedes the Grade Weight hard-cap assumption in this older issue. Grade Weight totals above 100 are valid; totals below 100 remain warnings when grading data is present.

Status: ready-for-human

## Parent

.scratch/unihub-course-platform/PRD.md

## What to build

Build the first end-to-end data path for UniHub: catalog data, split Course files, schema validation, loading, and hierarchy reconstruction. A completed slice should prove that canonical repository JSON can be loaded from Course Paths and rendered or queried as `Academic Year -> Study Year -> Semester -> Course`.

This slice should respect the ADRs for folder-hierarchy Course files, explicit Course Sessions, and JSON Schema validation. Include representative sample data that exercises Materials, Assignment Deadlines, Course Sessions, Exams, Grade Weights, Activity timestamps, and both local/external Material links.

## Acceptance criteria

- [ ] Catalog data defines Academic Year, Study Year, Semester labels, and display ordering.
- [ ] Course data is stored as one JSON document per Course, with Academic Year, Study Year, and Semester derived from the Course Path.
- [ ] Course IDs are unique within a Semester, and Course item IDs are unique within a Course.
- [ ] JSON Schema validation exists for catalog and Course data.
- [ ] Validation accepts valid sample data and rejects malformed catalog or Course data.
- [ ] Validation rejects duplicate local IDs, invalid Material References, invalid Session Status values, Course Sessions whose end is before their start, Assignment Deadlines without `dueAt`, and Grade Weight totals above 100.
- [ ] Validation allows incomplete but valid data, including Grade Weight totals below 100 and Exams without `startsAt`.
- [ ] Tests verify the loaded data reconstructs the expected Academic Year, Study Year, Semester, and Course hierarchy.

## Blocked by

None - can start immediately
