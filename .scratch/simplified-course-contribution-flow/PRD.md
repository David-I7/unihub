Status: ready-for-agent

# PRD: Simplified Course Contribution Flow

## Problem Statement

UniHub's Contribution page currently exposes raw JSON, low-level local IDs, and repository-maintenance timestamps to contributors. That makes a normal Contribution feel intimidating even when the user only wants to add a Course, add an Exam, attach a Material, or correct Course information.

The Course domain model has also been sharpened. Materials, Assignment Deadlines, Course Sessions, and Exams should all carry repository-maintenance timestamps, Material URLs must point to external resources, and new Course IDs should be derived from user-facing Course titles instead of typed by contributors. The implementation still treats several of these details as optional or contributor-authored.

## Solution

Replace the raw JSON Contribution page with task-shaped Contribution flows. Contributors should choose what they are trying to do, fill in normal form fields, and let UniHub generate the repository JSON, local IDs, timestamps, target path, GitHub issue body, and pull request assist content.

The normal Contribution page should not show a JSON editor. In issue mode, generated JSON should be placed directly into the prefilled GitHub issue body. In pull request assist mode, generated JSON and PR text should be copied to the clipboard while the app sends the contributor to the relevant GitHub edit/create link where possible.

The Course data model and validation should be aligned with the new rules: all Course items require `addedAt` and `updatedAt`, new items set both timestamps to the creation time, updates replace `updatedAt`, and Material URLs must be external URLs.

## User Stories

1. As a contributor, I want to add a Course without typing JSON, so that creating Course information feels approachable.
2. As a contributor, I want to add a Material through a form, so that I can share a useful resource without learning the repository schema.
3. As a contributor, I want to update a Material through a form, so that I can correct links or names without editing raw JSON.
4. As a contributor, I want to add an Assignment Deadline through a form, so that deadline Contributions are fast and clear.
5. As a contributor, I want to add an Exam through a form, so that assessment information can be contributed without understanding Material References.
6. As a contributor, I want to add a Course Session through a form, so that schedule information can be contributed with normal date and time fields.
7. As a contributor, I want to edit Course metadata through a form, so that Course title, professors, and description are easy to correct.
8. As a contributor, I want the app to derive a Course ID from the Course title, so that I do not have to invent a repository identifier.
9. As a contributor, I want generated IDs for Materials, Assignment Deadlines, Course Sessions, and Exams, so that I do not need to understand local ID conventions.
10. As a contributor, I want generated IDs to be readable, so that maintainers can still understand the resulting Contribution.
11. As a contributor, I want generated ID collisions handled automatically, so that a valid Contribution is not blocked by a hidden naming detail.
12. As a contributor, I want repository-maintenance timestamps hidden, so that I only provide academic information.
13. As a contributor, I want new items to receive generated `addedAt` and `updatedAt`, so that Activity data is complete without manual timestamp entry.
14. As a contributor, I want updated items to receive a generated `updatedAt`, so that corrections are reflected in Activity.
15. As a contributor, I want date and time fields for `startsAt`, `endsAt`, and `dueAt`, so that I do not need to type ISO datetimes.
16. As a contributor, I want an Exam date to be optional, so that I can add an Exam before the date is announced.
17. As a contributor, I want the app to warn when an Exam date is not announced, so that I understand the Course data is incomplete but valid.
18. As a contributor, I want Course Session status to default to scheduled, so that common lecture additions require less input.
19. As a contributor, I want Course Session cancellation to remain expressible, so that cancelled sessions can still be represented.
20. As a contributor, I want Material type to be chosen from a controlled list, so that invalid Material types are not submitted.
21. As a contributor, I want Material URLs to require external links, so that local file paths and site-relative paths are rejected before review.
22. As a contributor, I want Assignment Deadline Materials to be selected from compatible assignment Materials, so that invalid Material References are avoided.
23. As a contributor, I want Exam Materials to be selected from compatible exam Materials, so that exam-specific resources appear in the right place.
24. As a contributor, I want to add a new exam Material while adding an Exam, so that I do not need two separate Contributions for the common case.
25. As a contributor, I want to attach an existing exam Material while adding an Exam, so that reusable resources can be linked without duplication.
26. As a contributor, I want to add a new assignment Material while adding an Assignment Deadline, so that assignment instructions can be contributed with the deadline.
27. As a contributor, I want to attach existing assignment Materials while adding an Assignment Deadline, so that existing resources can be reused.
28. As a contributor, I want the app to generate empty child arrays for a new Course, so that I only provide useful Course metadata.
29. As a contributor, I want Course professors to be editable as normal text fields, so that I do not have to write a string array.
30. As a contributor, I want optional Course description to be a normal text area, so that Course context can be added naturally.
31. As a contributor, I want validation errors shown near the relevant form fields, so that I know what to fix.
32. As a contributor, I want warnings to be visible but non-blocking, so that incomplete valid data can still be proposed.
33. As a contributor, I want issue mode to open a prefilled GitHub issue, so that I do not need to copy JSON manually.
34. As a contributor, I want pull request assist mode to copy generated JSON and PR text to the clipboard, so that GitHub editing is less error-prone.
35. As a contributor, I want pull request assist mode to show the target file path, so that I know which Course file I am changing.
36. As a contributor, I want pull request assist mode to open a GitHub edit/create link when possible, so that I can continue the Contribution in GitHub.
37. As a contributor, I want the normal Contribution page to hide raw JSON, so that the flow feels like a product feature rather than a developer tool.
38. As a maintainer, I want generated issue bodies to include Contribution type, target path, generated JSON, validation result, and warnings, so that review remains efficient.
39. As a maintainer, I want generated PR assist text to include a useful title and body, so that repository reviews stay consistent.
40. As a maintainer, I want Course IDs to remain deterministic and tied to Course titles, so that Course files are predictable.
41. As a maintainer, I want Course `id` to match the Course Path course identifier, so that routing and repository loading stay coherent.
42. As a maintainer, I want Course item IDs to remain unique within a Course, so that Material References and updates are unambiguous.
43. As a maintainer, I want all Materials to have external URLs, so that UniHub does not imply that it hosts local files.
44. As a maintainer, I want repository validation to reject missing `addedAt`, so that Activity data remains complete.
45. As a maintainer, I want repository validation to reject missing `updatedAt`, so that every item has a current-change timestamp.
46. As a maintainer, I want new items to set `addedAt` and `updatedAt` to the same creation timestamp, so that newly added records satisfy the canonical schema.
47. As a maintainer, I want updates to preserve `addedAt`, so that original creation history is not lost.
48. As a maintainer, I want updates to replace `updatedAt`, so that the latest change is visible.
49. As a student, I want Activity to use `addedAt` and `updatedAt` across Materials, Assignment Deadlines, Course Sessions, and Exams, so that recent Course changes are visible.
50. As a student, I want undated Exams to stay out of the Calendar, so that the Calendar only shows dated items.
51. As a student, I want dated Exams to appear on the Calendar, so that I can plan around assessments.
52. As a student, I want Assignment Deadlines to keep appearing on the Calendar, so that due dates remain discoverable.
53. As a student, I want Course Sessions to keep appearing on the Calendar, so that schedule information remains discoverable.
54. As a student, I want exam-specific Materials to appear through Exams, so that assessment resources are shown in context.
55. As a student, I want assignment-specific Materials to appear through Assignment Deadlines, so that work resources are shown in context.
56. As a student, I want general Materials to remain grouped by Material type, so that Course resources are easy to scan.
57. As a reviewer, I want the generated Contribution JSON to validate with the same rules used by repository checks, so that UI and CI do not disagree.
58. As a reviewer, I want malformed generated payloads to be impossible in normal UI paths, so that review focuses on accuracy, not syntax.
59. As an implementing agent, I want a clear domain API for preparing Contributions from task-shaped form state, so that UI behavior can be tested without brittle DOM assertions.
60. As an implementing agent, I want existing Contribution preparation contracts preserved where possible, so that issue and pull request flows do not regress.
61. As an implementing agent, I want sample Course data migrated to the tightened schema, so that repository validation passes.
62. As an implementing agent, I want existing Course detail, Activity, Calendar, and validation behavior covered by tests, so that the rewrite does not break student-facing pages.

## Implementation Decisions

- The Contribution page becomes task-shaped and form-driven.
- The normal Contribution page must not render a raw JSON editor.
- Existing Contribution modes remain GitHub issue and pull request assist.
- Issue mode should open a prefilled GitHub issue whose body includes generated repository JSON.
- Pull request assist mode should copy generated JSON and PR text to the clipboard and provide a GitHub edit/create link when possible.
- The app remains static and unauthenticated; direct repository writes are not introduced.
- Contribution tasks remain one high-level task at a time.
- The canonical task set is Add Material, Update Material, Add Assignment Deadline, Add Exam, Add Course Session, Edit Course metadata, and Add new Course.
- Add Exam may generate both an Exam and compatible exam Material records when the contributor provides new exam resources.
- Add Assignment Deadline may generate both an Assignment Deadline and compatible assignment Material records when the contributor provides new assignment resources.
- Existing compatible Materials should be selectable by display name rather than typed by local ID.
- Material References remain canonical in stored Course data.
- Course IDs should be derived from Course titles.
- Course item IDs should be derived from item titles or other user-facing item labels.
- ID generation should be deterministic, readable, lowercase, URL/path-safe, and collision-aware.
- Generated IDs may be displayed as secondary information, but they should not be primary inputs.
- New Course Contributions should generate required empty child arrays.
- New Course Contributions should set the generated Course ID in both the Course object and target Course Path.
- Course item arrays remain required even when empty.
- Materials, Assignment Deadlines, Course Sessions, and Exams require both `addedAt` and `updatedAt`.
- New Course items set `addedAt` and `updatedAt` to the same creation timestamp.
- Update flows preserve `addedAt` and replace `updatedAt`.
- Contributors should not type `addedAt` or `updatedAt`.
- Material `url` must be an external URL.
- Repository-relative paths, site-local paths, and uploaded local files are invalid Material URLs.
- Assignment Deadline `submissionUrl` may remain a normal URL field; this PRD only tightens Material `url`.
- Assignment Deadline `dueAt` remains required.
- Course Session `startsAt` and `endsAt` remain required.
- Course Session `endsAt` must remain after `startsAt`.
- Course Session status remains scheduled or cancelled.
- Course Session status should default to scheduled.
- Exam `startsAt` remains optional.
- Exams do not gain `endsAt`.
- Undated Exams remain valid with a warning.
- Undated Exams do not produce Calendar Events.
- Grade Weight remains optional on Assignment Deadlines and Exams.
- Grade Weight totals above 100 remain valid.
- Grade Weight totals below 100 remain warnings when known grading data exists.
- Contribution validation should reject missing generated timestamps.
- Contribution validation should reject non-external Material URLs.
- Contribution validation should continue rejecting duplicate local IDs.
- Contribution validation should continue rejecting missing Material References.
- Contribution validation should continue rejecting Assignment Deadline references to non-assignment Materials.
- Contribution validation should continue rejecting Exam references to non-exam Materials.
- Activity should derive from `addedAt` and `updatedAt` across Materials, Assignment Deadlines, Course Sessions, and Exams.
- Activity should distinguish additions from updates.
- Existing Course Path, Catalog, and public data ADRs remain authoritative.
- Existing Contribution issue and pull request preparation should be reused where it still fits, with a higher-level form-to-payload layer added above it.
- If clipboard access fails, the UI should make the generated PR content recoverable without reintroducing a primary JSON editor.

## Testing Decisions

- Tests should verify external behavior and domain contracts, not private helpers.
- The highest existing seam is the exported domain API for validation, Contribution preparation, Course detail derivation, Activity, Calendar Events, Course Path handling, and repository loading.
- The new UI seam should test the Contribution page as a user-facing flow: choose a task, fill fields, submit/generate, and observe issue or PR assist output.
- Domain tests should remain the primary prior art for schema and Contribution behavior.
- UI tests should be added only where domain tests cannot prove that raw JSON has been removed and task-shaped forms work.
- Validation tests should prove all Course item types require `addedAt`.
- Validation tests should prove all Course item types require `updatedAt`.
- Validation tests should prove new generated items set both timestamps.
- Validation tests should prove update flows preserve `addedAt` and replace `updatedAt`.
- Validation tests should prove Material URLs must be external.
- Validation tests should prove local, relative, and site-root Material URLs are rejected.
- Validation tests should prove external Material URLs are accepted.
- Contribution tests should prove Add new Course derives the Course ID from the title.
- Contribution tests should prove Add new Course generates required empty arrays.
- Contribution tests should prove generated Course ID is used in the target Course Path.
- Contribution tests should prove generated IDs are collision-aware.
- Contribution tests should prove Add Material generates IDs and timestamps.
- Contribution tests should prove Update Material generates `updatedAt` and preserves original `addedAt`.
- Contribution tests should prove Add Assignment Deadline can attach existing assignment Materials.
- Contribution tests should prove Add Assignment Deadline can generate new assignment Materials.
- Contribution tests should prove Add Exam can attach existing exam Materials.
- Contribution tests should prove Add Exam can generate new exam Materials.
- Contribution tests should prove Add Exam remains valid without `startsAt` and carries a warning.
- Contribution tests should prove dated Exams still produce Calendar Events.
- Contribution tests should prove undated Exams do not produce Calendar Events.
- Contribution tests should prove Course Session forms generate valid scheduled sessions by default.
- Contribution tests should prove Course Session end-before-start validation still blocks.
- Contribution tests should prove issue mode includes generated JSON in the issue body URL.
- Contribution tests should prove pull request assist exposes/copies generated JSON and PR body content.
- UI tests should prove the Contribution page does not render a JSON textarea in the normal flow.
- UI tests should prove contributors can complete Add new Course without entering an ID.
- UI tests should prove contributors can complete Add Exam without typing Material IDs.
- UI tests should prove date/time inputs are used for dates instead of raw JSON.
- Existing tests for public data loading, hierarchy reconstruction, Activity sorting, Calendar derivation, Material type validation, Grade Weight behavior, and Contribution preparation should remain passing.
- Run the repository test script after implementation.
- Run the production build after implementation.

## Out of Scope

- Adding user accounts, authentication, roles, or permissions.
- Writing directly to the repository from the app.
- Introducing a backend service or database.
- Hosting uploaded Material files inside UniHub.
- Supporting local file uploads for Materials.
- Changing Course Path semantics.
- Changing Catalog structure beyond what Add new Course requires for generated output.
- Changing Material Reference semantics to embedded Materials in canonical Course data.
- Removing GitHub issue mode.
- Removing pull request assist mode.
- Building a full GitHub OAuth PR creation flow.
- Adding update flows for every Course item if they are not needed to satisfy the task-shaped v1 flow.
- Adding delete/remove Contribution tasks.
- Redesigning Course detail pages, Calendar pages, or Activity layout beyond what is required by the tightened data model.
- Changing grade policy semantics.
- Changing Exam date optionality.

## Further Notes

The relevant testing seams are assumed to be:

- Domain API tests for schema, generated payloads, Contribution preparation, Activity, and Calendar behavior.
- Contribution page UI tests for the absence of raw JSON and completion of task-shaped forms.

The product docs were updated before this PRD. They now state that the Contribution page should be task-shaped, raw JSON should be hidden, Course item timestamps should be generated, all Course items require `addedAt` and `updatedAt`, and Material URLs must be external.

The current implementation is known to be behind these decisions. It still exposes a raw JSON Contribution textarea, treats timestamps as optional in several places, only fully supports `updatedAt` on Materials, and sample Course data still includes local Material URLs.
