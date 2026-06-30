Status: completed

# Add update-material Contributions

## Parent

.scratch/course-data-domain-fixes/PRD.md

## What to build

Add an update-material Contribution path so contributors can correct or replace an existing Material. The flow should validate that the target Material already exists, apply only the requested Material change, preserve unrelated Course data, and generate issue or pull request assist output through the existing Contribution preparation flow.

## Acceptance criteria

- [x] update-material is available as a supported Contribution type.
- [x] update-material validates payload fields used to update an existing Material, including title, type, url, and updatedAt.
- [x] update-material fails when the target Material ID is missing from the target Course.
- [x] update-material does not create a new Material.
- [x] update-material rejects invalid Material types.
- [x] update-material preserves unrelated Course data when applying a change.
- [x] update-material generates issue-mode output.
- [x] update-material generates pull-request assist output.
- [x] Schema guidance and sample payloads document update-material.
- [x] Tests cover success, missing target Material, invalid type, preservation of unrelated data, and both output modes.

## Blocked by

- .scratch/course-data-domain-fixes/issues/03-show-material-updates-in-activity.md
