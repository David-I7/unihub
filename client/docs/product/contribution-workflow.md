# Contribution Workflow

UniHub is deployed as a static GitHub Pages app. Contributions are GitHub-native and must be approved by maintainers before they become canonical data.

## Contribution Modes

The `Contribute` page is visible in the main navigation, but it is framed as a maintainer and advanced contribution surface:

```text
Maintainer contributions

Use this page for repository-level course data changes, advanced corrections, and preparing GitHub issues for maintainer review. If you are a student fixing a specific course item, start from that course page and use Suggest update.
```

The contribution page prepares:

```text
Create GitHub issue
```

The app validates the proposed contribution and generates the target path plus repository JSON behind the scenes. Pull request assist is not part of the product or domain contract.

## Contribution Tasks

Normal student suggestions start from the Course detail page rather than from the advanced `Contribute` page. Course pages expose contextual suggestion actions:

```text
Course header -> Suggest course info update
Materials tab -> Suggest material update
Assignments tab -> Suggest assignment update
Lectures tab -> Suggest lecture update
Exams tab -> Suggest exam update
```

The first version should use one suggestion action per section or tab. Per-item suggestion actions, such as "fix this material" beside each row, can be added later after the section-level flow is working.

Section-level suggestion actions may ask one short follow-up question when the section contains multiple common intents. For Materials, the first choice is:

```text
Add missing material
Fix an existing material
Report a broken link
```

These labels are student-facing suggestion intents. Internally, the app maps them to contribution behavior such as `add-material` or `update-material`; students should not see raw contribution type names in the normal suggestion flow.

Student suggestions may include a short note or source to help maintainers verify the change. The requirement depends on the risk of the suggestion:

```text
Add missing material:
- Title
- Type
- Link
- Note/source optional

Fix existing material:
- Existing material
- Corrected fields
- Note/source required

Report broken link:
- Existing material
- What happened
- Replacement link optional
- Note/source optional
```

Corrections to existing information require a note or source because maintainers need to understand why the canonical course information should change. Simple additions may keep the note optional to avoid making low-risk suggestions feel heavy.

Assignments, Lectures, and Exams use the same pattern with section-specific wording:

```text
Assignments:
- Add missing assignment
- Fix assignment details
- Report changed deadline

Lectures:
- Add missing lecture
- Fix lecture details
- Report cancellation
- Report changed time/location

Exams:
- Add missing exam
- Fix exam details
- Report changed exam date/location
- Report exam date not announced
```

The UI should keep these as suggestion intents and only map them to contribution types inside the app. When an intent changes existing canonical information, the suggestion requires a note or source.

When adding or updating an Assignment Deadline or Exam from the student suggestion flow, the form displays existing compatible Materials in a multiselect. Assignment forms show only `assignment` Materials; Exam forms show only `exam` Materials. If no compatible Materials exist, the form should show an empty state that directs the user to add the needed Material first.

After a student fills a suggestion form, the normal suggestion flow shows a human-readable review summary only. It must not show JSON, repository target paths, or raw contribution type names.

Example summary:

```text
You are suggesting this update to Algorithms:

Add video material
Title: Lecture 4 recording
Link: https://example.edu/lecture-4
Source: Posted in Teams by the professor

This will be sent for maintainer review.
```

The app may still generate contribution payloads, GitHub issue content, target paths, and validation details internally.

When a student submits a suggestion, the app shows a short GitHub handoff step before leaving UniHub:

```text
UniHub uses GitHub for maintainer review.

We will open a prefilled issue with your suggestion. You can review it on GitHub before submitting.
```

The handoff action is:

```text
Continue to GitHub
```

The canonical GitHub repository for generated issue links is:

```text
https://github.com/David-I7/unihub
```

GitHub issues created from the normal student suggestion flow use student-facing language in their title and main body. They should not lead with raw contribution type names.

Example issue title:

```text
Suggestion: Add material to Algorithms
```

Example issue body:

```text
Diff:
...

New state:
...
```

Generated GitHub issue bodies are maintainer-facing review artifacts. They should contain only the proposed diff and the resulting new state, without validation chatter, warnings, raw form metadata, or explanatory prose. The student-facing summary remains in the in-app suggestion review step before GitHub handoff.

UniHub does not track student suggestion status in-app for v1. After the GitHub handoff, GitHub is the review and status surface.

The handoff or confirmation copy should set that expectation:

```text
After submitting on GitHub, maintainers will review your suggestion there.
```

An in-app suggestion inbox, personal submission history, and status tracker are out of scope until the product has accounts, GitHub API integration, or another durable submission backend.

Users contribute one high-level task at a time:

```text
Add material
Update material
Add assignment
Add exam
Add lecture
Edit course metadata
Add new course
```

The contribution page should present task-shaped forms instead of storage-shaped JSON editing. Contributors fill in domain fields such as course title, course description, Material Difficulty, Passing Difficulty, exam date, material link, grade weight, and professor names. The UI generates local IDs, timestamps, empty arrays, target paths, JSON snippets, and full updated course JSON.

Task-shaped forms that can link Materials should use the same compatible-Material multiselect rule as student suggestions. The maintainer flow should make repeated additions explicit with actions such as `Add another material`, `Add another assignment`, `Add another exam`, or `Add another lecture` where batch creation is supported.

Batch creation is supported for repeated Course items:

```text
materials
assignmentDeadlines
exams
courseSessions
```

Batch creation is not part of metadata edits, new Course creation, Academic Year creation, Study Year creation, or Semester creation because those changes are structurally singular and should stay easy to review.

Whole-course JSON editing is not part of the normal v1 flow. Raw JSON should not be visible on the contribution page.

## Target Selection

For existing course contributions, users choose:

```text
Academic Year -> Study Year -> Semester -> Course
```

The app computes the target file path:

```text
public/data/courses/2025-2026/year-1/semester-1/data-structures.json
```

For new course contributions, users choose:

```text
Academic Year -> Study Year -> Semester
```

and enter the new course title, professors, optional description, Material Difficulty, and Passing Difficulty. The app derives the course ID from the title and uses it for both the course file path and the course `id`. Difficulty fields are shown with `unknown` preselected so the generated Course JSON is valid even when the real difficulty is not known yet.

Adding a new Course is always a two-file contribution:

```text
public/data/courses/{academicYearId}/{studyYearId}/{semesterId}/{courseId}.json
public/data/catalog.json
```

The generated output must create the new Course JSON file and generate the matching `catalog.json` diff that adds the Course to the selected Semester. A new Course contribution is incomplete if the Course file exists but the Catalog hierarchy does not reference it.

Manual path entry should be hidden or treated as advanced.

Catalog-structure contributions are authored through Add Semester. Add Semester can optionally create a new Academic Year and/or Study Year in the same contribution when the maintainer explicitly toggles those sections open. New Course creation requires `academicYearId`, `studyYearId`, and `semesterId`. These fields must not be presented as optional in the UI because the Catalog hierarchy cannot be updated unambiguously without them.

Catalog labels and IDs should not be independently typed when one can be derived from the other. The normal flow is label-first: the user enters the label, the UI derives the ID, and the generated ID is shown as secondary text. Maintainers may override the generated ID only in an advanced/moderator flow when the normal derivation is wrong.

## Generated Fields

The contribution UI owns repository-maintenance fields:

```text
id
addedAt
updatedAt
empty child arrays for new courses
course session status defaults
```

Contributors should not type these fields directly during the normal flow.

IDs should be deterministic, readable, and derived from user-facing fields such as course title, material title, assignment title, exam title, or session title. If a generated ID collides with an existing item, the UI should adjust it predictably and show the generated label only as secondary information.

`addedAt` is generated for new materials, assignment deadlines, course sessions, and exams. `updatedAt` is generated for supported update flows.
New items set both `addedAt` and `updatedAt` to the creation time.

## Issue Flow

The UI opens a prefilled GitHub issue containing:

```text
Diff
New state
```

The generated JSON is placed directly in the issue body through the GitHub issue link. The contribution page should not show contributors a JSON editor or require them to copy JSON for the issue flow.

Issues are reviewed and approved by maintainers before data is merged.

## Validation Behavior

The contribution UI blocks invalid data.

Blocked examples:

```text
Broken JSON
Missing required fields
Duplicate local IDs
Invalid materialIds
Material URL is not external
Missing generated addedAt
Missing generated updatedAt
Assignment without dueAt
Assignment linked to a non-assignment material
Exam linked to a non-exam material
Lecture endsAt before startsAt
Material update targeting a missing material
```

The contribution UI allows incomplete but valid data with warnings.

Warning examples:

```text
Grade weights total below 100
Exam date not announced
Course has no materials yet
```

## Maintainer Review

Maintainers are responsible for:

```text
Checking accuracy
Resolving warnings when necessary
Approving or rejecting the contribution
Merging canonical JSON into the repository
```
