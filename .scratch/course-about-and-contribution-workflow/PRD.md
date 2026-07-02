Status: ready-for-agent

# PRD: Course About and Contribution Workflow Alignment

## Problem Statement

Students need Course detail pages to explain what a Course is like, not only list Materials, Assignment Deadlines, Course Sessions, and Exams. Today the Course detail view does not have a dedicated About section for Course description, Material Difficulty, Passing Difficulty, and Grade Breakdown.

Maintainers and contributors also need the Course data model, validation, student Suggestion flow, maintainer Contribution flow, and GitHub handoff output to agree. Several fields are currently ambiguous or stale: Exams should require Grade Weight and support optional location and exam-specific notes, Assignment Deadlines should no longer have a separate submission URL, Academic Year targeting must not be treated as optional in Catalog changes, new Course Contributions must include the Catalog change that makes the Course discoverable, and generated GitHub issue/PR bodies should be review artifacts containing only the diff and resulting state.

## Solution

Add a Course About section to Course detail pages. The About section shows Course description, Material Difficulty, Passing Difficulty, and a Grade Breakdown derived from Assignment Deadline and Exam Grade Weight values. Material Difficulty and Passing Difficulty are required Course fields with controlled values of `easy`, `medium`, `hard`, and `unknown`; all existing Course records use `unknown` until real values are known. Difficulty labels are color-coded only on Course detail pages, not on Home course cards.

Bring the data model and workflows into sync with that product behavior. Exams require Grade Weight, may include optional location, and may include optional description for exam-specific notes. Assignment Deadline submission details live in the Assignment Deadline description, not in a separate submission URL. Student and maintainer forms for Exams and Assignment Deadlines link existing compatible Materials through a multiselect. Maintainer forms support explicit repeated additions for Materials, Assignment Deadlines, Exams, and Course Sessions.

Generated Contributions should be complete review artifacts. Adding a new Course generates both the new Course state and the matching Catalog diff. GitHub issue and PR bodies contain only the proposed diff and new state. Pull request assist links target canonical public data files and acknowledge that plain GitHub file URLs cannot atomically create a new Course file and edit the Catalog in one step.

## User Stories

1. As a student, I want a Course About section, so that I can understand the Course before browsing individual tabs.
2. As a student, I want to read the Course description in About, so that general Course context is easy to find.
3. As a student, I want to see Material Difficulty in About, so that I can estimate how hard the Course materials are to follow.
4. As a student, I want to see Passing Difficulty in About, so that I can estimate how hard it is to pass the Course.
5. As a student, I want difficulty labels to be color-coded, so that difficulty is quickly scannable.
6. As a student, I want `easy` difficulty to be green, so that easy Courses are visually distinct.
7. As a student, I want `medium` difficulty to be amber, so that moderate Courses are visually distinct.
8. As a student, I want `hard` difficulty to be red, so that difficult Courses are visually distinct.
9. As a student, I want `unknown` difficulty to be neutral gray, so that missing knowledge is not confused with an actual difficulty rating.
10. As a student, I want missing difficulty information to display as `unknown`, so that the UI remains honest when maintainers do not know the value.
11. As a student, I want Course cards to stay compact, so that Home remains easy to scan.
12. As a student, I do not want Material Difficulty or Passing Difficulty on Course cards, so that subjective ratings do not dominate course browsing.
13. As a student, I want Grade Breakdown in About, so that grading percentages are visible without opening every tab.
14. As a student, I want Grade Breakdown to show known Assignment Deadline and Exam percentages, so that I understand the final-grade components.
15. As a student, I want Grade Breakdown to avoid extra grading prose, so that percentages stay clear.
16. As a student, I want assignment-specific notes to appear with the Assignment Deadline, so that assignment instructions stay where I use them.
17. As a student, I want exam-specific notes to appear with the Exam, so that exam rules stay where I use them.
18. As a student, I want Assignment Deadline submission instructions in the description, so that I do not have to check a separate submission URL field.
19. As a student, I want Exam cards to show location when known, so that I know where the Exam happens.
20. As a student, I want Exam cards to show description when present, so that exam-specific rules are visible.
21. As a student, I want Exams without dates to remain visible, so that announced-later Exams are still represented.
22. As a student, I want Exam Grade Weight to always be present, so that every Exam's effect on the grade is clear.
23. As a maintainer, I want Material Difficulty to use a controlled vocabulary, so that Course data stays consistent.
24. As a maintainer, I want Passing Difficulty to use the same controlled vocabulary, so that difficulty fields can share validation and display behavior.
25. As a maintainer, I want Course records to require Material Difficulty and Passing Difficulty, so that data and UI behavior do not drift.
26. As a maintainer, I want existing Course records to use `unknown`, so that migration does not require guessing.
27. As a maintainer, I want new Course generation to default difficulty fields to `unknown`, so that generated Course JSON is valid by default.
28. As a maintainer, I want new Course forms to expose difficulty fields with `unknown` preselected, so that known values can be entered when available.
29. As a maintainer, I want Course metadata edits to update difficulty fields, so that About data can be corrected later.
30. As a maintainer, I want invalid difficulty values blocked, so that color coding and filtering assumptions remain safe.
31. As a maintainer, I want Exams to require Grade Weight, so that the grading model is explicit.
32. As a maintainer, I want Exams to allow optional location, so that rooms and links can be represented when known.
33. As a maintainer, I want Exams to allow optional description, so that exam-specific rules have an official place.
34. As a maintainer, I want Assignment Deadline Grade Weight to remain optional, so that ungraded deadlines can be represented.
35. As a maintainer, I want Assignment Deadline submission URL removed, so that submission details are not split between fields.
36. As a maintainer, I want validation to reject Assignment Deadline submission URL, so that stale data shape does not persist.
37. As a contributor, I want Assignment Deadline forms to use a Material multiselect, so that I can link existing assignment Materials without typing IDs.
38. As a contributor, I want Exam forms to use a Material multiselect, so that I can link existing exam Materials without typing IDs.
39. As a contributor, I want Assignment Deadline Material multiselects to show only assignment Materials, so that I cannot create invalid Material References.
40. As a contributor, I want Exam Material multiselects to show only exam Materials, so that I cannot create invalid Material References.
41. As a contributor, I want an empty state when no compatible Materials exist, so that I know I should add the needed Material first.
42. As a student using Suggestion flow, I want compatible Material selection when suggesting Assignments or Exams, so that my Suggestion is valid before GitHub handoff.
43. As a maintainer using the advanced Contribution flow, I want compatible Material selection when adding Assignments or Exams, so that generated Contributions pass validation.
44. As a maintainer, I want an explicit `Add another material` action, so that adding multiple Materials is clear.
45. As a maintainer, I want an explicit `Add another assignment` action, so that adding multiple Assignment Deadlines is clear.
46. As a maintainer, I want an explicit `Add another exam` action, so that adding multiple Exams is clear.
47. As a maintainer, I want an explicit `Add another lecture` action, so that adding multiple Course Sessions is clear.
48. As a maintainer, I do not want metadata edits batched, so that structural review stays simple.
49. As a maintainer, I do not want new Course creation batched, so that each Course can be reviewed independently.
50. As a maintainer, I do not want Academic Year, Study Year, or Semester creation batched, so that Catalog hierarchy changes stay reviewable.
51. As a contributor, I want Academic Year target fields to be required where needed, so that Catalog changes are unambiguous.
52. As a contributor, I want Study Year target fields to be required where needed, so that Semester and Course additions land in the right place.
53. As a contributor, I want Semester target fields to be required for new Course additions, so that the Course Path is complete.
54. As a contributor, I want Catalog entry forms to be label-first, so that I can type human-readable labels.
55. As a contributor, I want IDs generated from labels, so that IDs are deterministic and I do not have to invent storage names.
56. As a maintainer, I want generated IDs visible as secondary text, so that I can review what will be stored.
57. As a maintainer, I want advanced ID override when derivation is wrong, so that unusual Catalog labels remain possible.
58. As a maintainer, I want new Course Contributions to include the Catalog diff, so that new Courses become discoverable.
59. As a maintainer, I want new Course Contributions to include the new Course state, so that the Course file can be reviewed.
60. As a maintainer, I want a new Course Contribution to be considered incomplete without the Catalog update, so that orphaned Course files are not produced.
61. As a contributor, I want issue bodies to contain only diff and new state, so that maintainers review the actual proposed change.
62. As a contributor, I want PR bodies to contain only diff and new state, so that pull request review stays focused.
63. As a student, I want the in-app Suggestion summary to remain human-readable, so that I understand my Suggestion before leaving UniHub.
64. As a maintainer, I do not want GitHub issue bodies to include validation chatter, so that review is not noisy.
65. As a maintainer, I do not want GitHub issue bodies to include raw form metadata, so that the review artifact is clean.
66. As a maintainer, I want pull request assist links to target canonical public data files, so that contributors edit the right source of truth.
67. As a maintainer, I want existing Course changes to use GitHub edit links, so that pull request assist opens the correct file.
68. As a maintainer, I want new Course creation to use a GitHub create-file link where possible, so that the contributor starts in the right place.
69. As a maintainer, I want multi-file PR limitations explained in the PR assist step, so that contributors understand why the Catalog diff must be copied.
70. As a reviewer, I want repository validation, Contribution validation, and UI generation rules to agree, so that users do not hit avoidable mismatches.

## Implementation Decisions

- Use the existing Course detail page as the user-facing surface for the new About section.
- About shows Course description, Material Difficulty, Passing Difficulty, and derived Grade Breakdown.
- About does not duplicate assignment-specific or exam-specific notes.
- Home course cards remain limited to Course title and professor names.
- Difficulty values are `easy`, `medium`, `hard`, and `unknown`.
- Difficulty fields are required on Course records.
- Existing Course data has been migrated to explicit `unknown` values where real difficulty is unknown.
- New Course generation defaults both difficulty fields to `unknown`.
- New Course forms show difficulty controls with `unknown` selected by default.
- Course metadata edits include Material Difficulty and Passing Difficulty.
- Difficulty controls should use select-style inputs or segmented controls, not free text.
- Difficulty badges use green for `easy`, amber for `medium`, red for `hard`, and neutral gray for `unknown`.
- Grade Breakdown is derived from Assignment Deadline and Exam Grade Weight values.
- Grade Breakdown displays known percentages only.
- Assignment Deadline `description` is the place for assignment notes and submission instructions.
- Assignment Deadline no longer has `submissionUrl`.
- Assignment Deadline Grade Weight remains optional.
- Exam Grade Weight is required.
- Exam `description` is optional and stores exam-specific notes.
- Exam `location` is optional.
- Exams may still omit start date when the date is not announced.
- Contribution and repository validation use zod as the runtime source of truth.
- Validation rejects missing Course difficulty fields.
- Validation rejects difficulty values outside the controlled vocabulary.
- Validation rejects Exam payloads without Grade Weight.
- Validation allows Assignment Deadline payloads without Grade Weight.
- Validation rejects stale Assignment Deadline submission URL data.
- Existing Material Reference validation remains: Assignment Deadlines reference assignment Materials and Exams reference exam Materials.
- Student Suggestion forms for Assignment Deadlines and Exams use compatible-Material multiselects.
- Maintainer Contribution forms for Assignment Deadlines and Exams use compatible-Material multiselects.
- Assignment Deadline Material multiselects show only assignment Materials.
- Exam Material multiselects show only exam Materials.
- Empty compatible-Material lists show an empty state that directs the user to add the needed Material first.
- Maintainer Contribution UI supports batch creation for Materials, Assignment Deadlines, Exams, and Course Sessions.
- Batch creation is exposed through explicit actions such as `Add another material`, `Add another assignment`, `Add another exam`, and `Add another lecture`.
- Batch creation is not supported for Course metadata edits, new Course creation, Academic Year creation, Study Year creation, or Semester creation.
- Catalog-structure Contributions require explicit hierarchy target fields for the level being modified.
- Study Year creation requires an Academic Year target.
- Semester creation requires Academic Year and Study Year targets.
- New Course creation requires Academic Year, Study Year, and Semester targets.
- Catalog entry forms are label-first in the normal flow.
- IDs are derived from labels and shown as secondary generated values.
- ID override is limited to advanced or maintainer-oriented flows.
- New Course Contributions generate both the new Course state and the Catalog diff that makes the Course discoverable.
- A new Course Contribution is incomplete if it creates Course data without the corresponding Catalog update.
- GitHub issue bodies contain only the proposed diff and the resulting new state.
- GitHub PR bodies contain only the proposed diff and the resulting new state.
- In-app student Suggestion summaries remain human-readable before GitHub handoff.
- Pull request assist links target canonical public data files.
- Existing-file PR assist should use GitHub edit links.
- New Course PR assist should use a GitHub create-file link for the Course data and include the Catalog diff in copied PR content.
- PR assist copy should explicitly state that plain GitHub file URLs cannot atomically create one file and edit another.
- No ADR is needed for this work because it refines product data and workflow behavior within existing architecture decisions.

## Testing Decisions

- Tests should verify externally visible behavior and domain contracts, not private helper names.
- The primary test seam is the existing domain layer used for repository validation, Contribution validation, Course detail derivation, and Contribution preparation.
- Existing Node test coverage is the prior art; add or update tests in the same style before introducing a new test framework.
- Repository validation tests should prove Course records require Material Difficulty and Passing Difficulty.
- Repository validation tests should prove difficulty values must be one of `easy`, `medium`, `hard`, or `unknown`.
- Repository validation tests should prove existing fixture Course data with `unknown` difficulty is valid.
- Repository validation tests should prove Assignment Deadline `submissionUrl` is rejected.
- Repository validation tests should prove Assignment Deadline Grade Weight remains optional.
- Repository validation tests should prove Exam Grade Weight is required.
- Repository validation tests should prove Exam `description` and `location` are valid when present.
- Course detail tests should prove About data can be derived from Course description, Material Difficulty, Passing Difficulty, and Grade Breakdown.
- Course detail tests should prove Grade Breakdown includes known Assignment Deadline and Exam percentages.
- Course detail tests should prove assignment notes remain attached to Assignment Deadlines.
- Course detail tests should prove exam notes remain attached to Exams.
- Contribution validation tests should prove `edit-course-metadata` accepts Material Difficulty and Passing Difficulty.
- Contribution validation tests should prove invalid difficulty values are blocked in metadata edits and new Course payloads.
- Contribution validation tests should prove `add-exam` requires Grade Weight.
- Contribution validation tests should prove `add-assignment-deadline` does not require Grade Weight.
- Contribution validation tests should prove compatible Material References remain enforced for Assignment Deadlines and Exams.
- Contribution generation tests should prove new Course output includes both Course data and the Catalog change.
- Contribution generation tests should prove generated issue bodies include only diff and new state.
- Contribution generation tests should prove generated PR bodies include only diff and new state.
- Contribution generation tests should prove pull request assist targets canonical public data paths.
- UI behavior that is hard to cover through domain tests should be checked through route/component-level tests or a lightweight browser verification pass.
- UI checks should cover Course About visibility, difficulty badge labels/colors, absence of difficulty labels on Home course cards, compatible-Material multiselect filtering, explicit add-another controls, required Catalog target fields, and label-first ID generation.
- Run the repository test suite after implementation.
- Run the production build after implementation because this changes route UI and typed domain contracts.

## Out of Scope

- Adding search, filtering, or sorting by Material Difficulty or Passing Difficulty.
- Showing difficulty labels on Home course cards.
- Creating a separate grading policy object.
- Adding free-form Course-level assignment notes or exam notes outside existing descriptions.
- Adding per-item Suggestion actions beyond the existing section-level Suggestion model.
- Supporting direct in-app writes to GitHub or a backend.
- Supporting one-click atomic multi-file pull request creation from the static app.
- Adding accounts, maintainer authentication, or in-app Suggestion status tracking.
- Changing Course Path semantics.
- Changing existing Course Session status values.
- Changing Material type vocabulary beyond the compatible-Material behavior described here.
- Replacing the existing zod validation approach.
- Adding a new ADR for these refinements.

## Further Notes

The domain glossary and product docs have already been updated with the settled terminology and workflow rules. Existing Course JSON under the repository's Course data fixtures has also been migrated to include explicit `unknown` difficulty fields.

This PRD intentionally builds on existing ADRs for GitHub-native Contributions, zod validation, public canonical data, and student Suggestions as the contextual front door. Implementation should treat those ADRs as constraints rather than reopen them.
