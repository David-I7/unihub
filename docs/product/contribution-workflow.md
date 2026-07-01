# Contribution Workflow

UniHub is deployed as a static GitHub Pages app. Contributions are GitHub-native and must be approved by maintainers before they become canonical data.

## Contribution Modes

The `Contribute` page is visible in the main navigation, but it is framed as a maintainer and advanced contribution surface:

```text
Maintainer contributions

Use this page for repository-level course data changes, advanced corrections, and preparing GitHub issues or pull requests for maintainer review. If you are a student fixing a specific course item, start from that course page and use Suggest update.
```

The contribution page lets users choose:

```text
Create GitHub issue
Open pull request
```

Both modes are assisted by the UI. The app validates the proposed contribution and generates the target path plus repository JSON behind the scenes.

The advanced `Contribute` page keeps both modes. It defaults to GitHub issue because issue creation is safer for students and semi-technical contributors who arrive there directly. Pull request assist remains available for maintainers and confident contributors.

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

After a student fills a suggestion form, the normal suggestion flow shows a human-readable review summary only. It must not show JSON, repository target paths, pull request bodies, or raw contribution type names.

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

The canonical GitHub repository for generated issue and pull request links is:

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
Course: Algorithms
Suggestion: Add missing material

Title: Lecture 4 recording
Type: Video
Link: https://example.edu/lecture-4
Source: Posted in Teams by the professor

Generated contribution:
- Type: add-material
- Target: public/data/courses/2025-2026/year-2/semester-1/algorithms.json
```

The generated contribution section exists for maintainers. The student-facing summary remains the primary content.

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

The contribution page should present task-shaped forms instead of storage-shaped JSON editing. Contributors fill in domain fields such as course title, exam date, material link, grade weight, and professor names. The UI generates local IDs, timestamps, empty arrays, target paths, JSON snippets, and full updated course JSON.

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

and enter the new course title, professors, and optional description. The app derives the course ID from the title and uses it for both the course file path and the course `id`.

Manual path entry should be hidden or treated as advanced.

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
Contribution type
Target path
Generated JSON snippet or full updated JSON
Validation result
Warnings, when present
```

The generated JSON is placed directly in the issue body through the GitHub issue link. The contribution page should not show contributors a JSON editor or require them to copy JSON for the issue flow.

Issues are reviewed and approved by maintainers before data is merged.

## Pull Request Flow

For pull requests, the UI provides:

```text
Target file path
Suggested PR title
Suggested PR body
GitHub edit/create link when possible
```

Because the app is static and unauthenticated, one-click PR creation is not required. The UI should copy the generated JSON and PR body to the clipboard for the pull request assist flow, then send the contributor to the relevant GitHub edit/create link when possible.

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
No professors listed
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
