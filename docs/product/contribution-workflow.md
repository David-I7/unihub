# Contribution Workflow

UniHub is deployed as a static GitHub Pages app. Contributions are GitHub-native and must be approved by maintainers before they become canonical data.

## Contribution Modes

The contribution page lets users choose:

```text
Create GitHub issue
Open pull request
```

Both modes are assisted by the UI. The app validates the proposed contribution and generates the target path plus repository JSON behind the scenes.

## Contribution Tasks

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
