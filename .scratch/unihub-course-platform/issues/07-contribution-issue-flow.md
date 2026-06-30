# Contribution Issue Flow

Status: ready-for-agent

## Parent

.scratch/unihub-course-platform/PRD.md

## What to build

Build the Contribute page flow for creating GitHub issues. Users should contribute one change at a time, choose the target Course from the existing hierarchy, enter the relevant Contribution data, see validation errors or warnings, and generate a prefilled GitHub issue body that maintainers can review.

This flow must not write directly to the repository. Issues remain maintainer-reviewed Contributions.

## Acceptance criteria

- [ ] Contribute page lets users choose one Contribution type at a time.
- [ ] Supported Contribution types include add Material, add Assignment Deadline, add Exam, add Course Session, edit Course metadata, and add new Course.
- [ ] Existing Course Contributions use Academic Year, Study Year, Semester, and Course selection from loaded data.
- [ ] New Course Contributions use Academic Year, Study Year, and Semester selection from loaded data.
- [ ] The UI computes and displays the target Course Path.
- [ ] The UI validates the Contribution before generating an issue.
- [ ] Blocking validation errors prevent issue generation.
- [ ] Allowed warnings are shown and included in the generated issue body.
- [ ] Generated issue content includes Contribution type, target Course Path, generated JSON or updated JSON, validation result, and warnings.
- [ ] The generated issue flow opens or provides a prefilled GitHub issue URL.
- [ ] Tests verify target selection, validation blocking, warning preservation, generated JSON, and issue body content.

## Blocked by

- .scratch/unihub-course-platform/issues/01-static-course-data-foundation.md
- .scratch/unihub-course-platform/issues/02-teams-like-app-shell-and-context-selection.md
- .scratch/unihub-course-platform/issues/06-contribution-validation-core.md
