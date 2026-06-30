# Contribution Workflow

UniHub is deployed as a static GitHub Pages app. Contributions are GitHub-native and must be approved by maintainers before they become canonical data.

## Contribution Modes

The contribution page lets users choose:

```text
Create GitHub issue
Open pull request
```

Both modes are assisted by the UI. The app validates the proposed contribution and generates the target path plus JSON.

## Contribution Types

Users contribute one change at a time:

```text
Add material
Add assignment
Add exam
Add lecture
Edit course metadata
Add new course
```

Whole-course JSON editing is not part of the normal v1 flow.

## Target Selection

For existing course contributions, users choose:

```text
Academic Year -> Study Year -> Semester -> Course
```

The app computes the target file path:

```text
src/data/2025-2026/year-1/semester-1/data-structures.json
```

For new course contributions, users choose:

```text
Academic Year -> Study Year -> Semester
```

and enter the new course ID, title, and professors.

Manual path entry should be hidden or treated as advanced.

## Issue Flow

The UI opens a prefilled GitHub issue containing:

```text
Contribution type
Target path
Generated JSON snippet or full updated JSON
Validation result
Warnings, when present
```

Issues are reviewed and approved by maintainers before data is merged.

## Pull Request Flow

For pull requests, the UI provides:

```text
Target file path
Full updated JSON or JSON snippet
Suggested PR title
Suggested PR body
GitHub edit/create link when possible
```

Because the app is static and unauthenticated, one-click PR creation is not required. Users may need to paste the generated JSON into GitHub.

## Validation Behavior

The contribution UI blocks invalid data.

Blocked examples:

```text
Broken JSON
Missing required fields
Duplicate local IDs
Invalid materialIds
Assignment without dueAt
Assignment linked to a non-assignment material
Exam linked to a non-exam material
Lecture endsAt before startsAt
Stored grade weights totaling above 100
```

The contribution UI allows incomplete but valid data with warnings.

Warning examples:

```text
Grade weights total below 100
No professors listed
Exam date not announced
Course has no materials yet
Missing optional addedAt
```

## Maintainer Review

Maintainers are responsible for:

```text
Checking accuracy
Resolving warnings when necessary
Approving or rejecting the contribution
Merging canonical JSON into the repository
```
