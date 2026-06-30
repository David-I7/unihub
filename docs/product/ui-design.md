# UI Design

UniHub uses a Microsoft Teams-inspired layout while staying focused on course information.

## Navigation

Desktop uses a left app rail:

```text
Home
Calendar
Contribute
```

Mobile uses bottom navigation:

```text
Home | Calendar | Contribute
```

The selected academic year, study year, and semester are remembered in `localStorage`.

Routing uses React Router with `HashRouter` for GitHub Pages compatibility.

## Home

The home page is organized as:

```text
Academic Year selector
Study Year selector
Semester selector
Course grid
Activity panel
```

Course cards show only:

```text
Course title
Professor names
```

Desktop shows Activity as a right-side panel. Mobile shows Activity below the course grid.

Activity shows the latest N items with `addedAt`, filtered to the selected academic year, study year, and semester.

## Course Details

Course detail pages show:

```text
Course title
Professors
Tabs
```

Tabs:

```text
Materials
Assignments
Lectures
Exams
```

### Materials

Materials are grouped by type and only show general material types:

```text
course
seminar
lab
other
```

Assignment and exam materials are not shown in the general Materials tab.

### Assignments

Assignments are sorted by due date and display:

```text
Title
Due date
Grade weight, when known
Description, when present
Submission URL, when present
Linked assignment materials
```

Assignment status is derived from `dueAt`, for example upcoming, due soon, or past.

### Lectures

Lectures are sorted by `startsAt` and display:

```text
Title
Start and end time
Location, when present
Status: scheduled, cancelled, or computed completed
```

Cancelled lectures remain visible and should use a cancelled visual style.

### Exams

Exams are sorted by `startsAt` when present. Exams without `startsAt` are shown as date to be announced.

Exam cards display:

```text
Title
Start date/time, when known
Location, when present
Grade weight, when known
Linked exam materials
```

## Calendar

The calendar is an agenda/list first, not a month grid in v1.

Filters:

```text
Academic year
Study year
Semester
Course
Event type: assignments, exams, lectures
Time range: upcoming, all
```

Default view shows upcoming events for the selected academic year, study year, and semester.

Calendar events are derived from:

```text
assignmentDeadlines
sessions
exams with startsAt
```

## Out of Scope for v1

The first version does not include:

```text
Search
Manual dark mode toggle
PWA/offline support
Announcements
Account/login features
Direct in-app writes to the repository
```
