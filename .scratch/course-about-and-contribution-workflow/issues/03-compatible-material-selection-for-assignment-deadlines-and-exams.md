Status: ready-for-agent

# Compatible Material selection for Assignment Deadlines and Exams

## Parent

.scratch/course-about-and-contribution-workflow/PRD.md

## What to build

Replace raw Material ID entry for Assignment Deadline and Exam linking with compatible-Material multiselects in both student Suggestion and maintainer Contribution flows. Assignment Deadline forms show only assignment Materials. Exam forms show only exam Materials. Empty compatible lists explain that the user should add the needed Material first.

## Acceptance criteria

- [ ] Student Assignment Deadline Suggestion forms list only assignment Materials in the linked Material multiselect.
- [ ] Student Exam Suggestion forms list only exam Materials in the linked Material multiselect.
- [ ] Maintainer Assignment Deadline Contribution forms list only assignment Materials in the linked Material multiselect.
- [ ] Maintainer Exam Contribution forms list only exam Materials in the linked Material multiselect.
- [ ] Forms show a useful empty state when no compatible Materials exist.
- [ ] Generated payloads still use Material References by Material ID.
- [ ] Existing validation still rejects Assignment Deadline references to non-assignment Materials.
- [ ] Existing validation still rejects Exam references to non-exam Materials.
- [ ] Tests cover compatible filtering, generated payloads, empty states where practical, and validation behavior.
- [ ] The repository test suite and production build pass.

## Blocked by

- .scratch/course-about-and-contribution-workflow/issues/02-exam-and-assignment-deadline-data-shape-alignment.md
