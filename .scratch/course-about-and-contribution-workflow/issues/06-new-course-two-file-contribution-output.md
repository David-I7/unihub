Status: ready-for-agent

# New Course two-file Contribution output

## Parent

.scratch/course-about-and-contribution-workflow/PRD.md

## What to build

Make new Course Contributions complete. Creating a Course generates valid Course JSON, including default `unknown` difficulty values, and the matching Catalog diff that adds the Course to the selected Semester. A generated new Course Contribution is incomplete if it does not include both the Course file state and the Catalog update.

## Acceptance criteria

- [ ] New Course generation includes Course ID, title, professors, optional description, Material Difficulty, Passing Difficulty, and empty child arrays.
- [ ] New Course generation defaults Material Difficulty and Passing Difficulty to `unknown` unless the user selects different values.
- [ ] New Course generation targets the canonical public Course data path.
- [ ] New Course generation produces a Catalog diff that adds the Course under the selected Semester.
- [ ] The generated Catalog diff preserves unrelated Catalog hierarchy data.
- [ ] New Course Contribution output clearly includes both the new Course state and the Catalog change.
- [ ] New Course validation fails or blocks output when required hierarchy targets are missing.
- [ ] Tests cover Course state generation, Catalog diff generation, required target handling, and preservation of unrelated Catalog data.
- [ ] The repository test suite and production build pass.

## Blocked by

- .scratch/course-about-and-contribution-workflow/issues/01-course-about-section-and-difficulty-contract.md
- .scratch/course-about-and-contribution-workflow/issues/05-catalog-target-and-label-first-id-generation.md
