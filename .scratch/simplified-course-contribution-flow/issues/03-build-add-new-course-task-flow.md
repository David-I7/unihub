# Build Add New Course Task Flow

Status: ready-for-agent

## Parent

.scratch/simplified-course-contribution-flow/PRD.md

## What to build

Build the first form-driven Contribution task: Add new Course. Contributors should choose Academic Year, Study Year, and Semester, then enter Course title, professors, and optional description. The app should derive the Course ID, generate the new Course JSON with empty child arrays and timestamps handled by the generated Contribution layer, validate it, and produce issue or PR assist output.

A completed slice should be demoable without typing a Course ID or raw JSON.

## Acceptance criteria

- [ ] Add new Course is presented as a normal form, not a JSON editor.
- [ ] Contributors enter Course title, professors, and optional description.
- [ ] The Course ID is derived from the Course title and is not a primary input.
- [ ] The generated Course ID is used in both the Course object and target Course Path.
- [ ] The generated Course includes required empty child arrays.
- [ ] Issue mode opens or exposes a prefilled GitHub issue body containing generated JSON and validation details.
- [ ] Pull request assist mode provides the target path, generated PR content, generated JSON, and GitHub edit/create link when possible.
- [ ] Validation errors and warnings are visible in the form flow.
- [ ] Tests prove Add new Course can be completed without entering JSON or a Course ID.

## Blocked by

- .scratch/simplified-course-contribution-flow/issues/02-introduce-generated-contribution-payloads.md
