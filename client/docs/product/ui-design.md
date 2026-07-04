# UI Design

UniHub uses a Microsoft Teams-inspired layout while staying focused on course information.

The Tailwind, shadcn, and lucide migration is component-system parity work, not a visual redesign. The app should keep the compact academic dashboard feel, desktop rail, mobile bottom navigation, course grid, agenda list, contribution split view, and schema guide dialog.

## Navigation

Desktop uses a left app rail:

```text
Home
Calendar
Contribute
```

`Contribute` remains visible in the main navigation, but the page is framed as a maintainer and advanced contribution surface. Normal student suggestions should be encouraged from the relevant course section instead of starting from the repository-oriented contribution page.

Mobile uses bottom navigation:

```text
Home | Calendar | Contribute
```

The selected academic year, study year, and semester are remembered in `localStorage`.

Routing uses React Router with `HashRouter` for GitHub Pages compatibility.

Route-level screens live under `src/pages`: `HomePage`, `CalendarPage`, `ContributePage`, and `CourseDetailPage`. Shared page chrome and navigation live under `src/layouts`, reusable UI pieces live under `src/components`, and shared hooks or non-domain helpers live outside route pages. Source imports use the `@/*` alias so shadcn components and split route files do not rely on deep relative paths.

The app layout owns the selected academic context, local persistence, course loading, loading states, and load errors. Route pages consume that shared state from the layout instead of reimplementing context loading or persistence.

Reusable UI primitives should come from shadcn when they directly match the interface: buttons, selects, cards, tabs, textareas, dialogs, tables, and status badges. Heavier shadcn patterns should wait until the product needs them.

Navigation and action icons use lucide instead of letters or emoji. Primary mappings are `House` for Home, `CalendarDays` for Calendar, `PlusCircle` or `GitPullRequestCreate` for Contribute, `Monitor`/`Sun`/`Moon` for theme state, `BookOpen` for the schema guide, `X` for close actions, and `CalendarRange` or `GraduationCap` for the academic context picker. Visible text labels remain in the rail and bottom navigation.

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

Course cards do not show Material Difficulty or Passing Difficulty. Difficulty labels appear only in the Course detail About section.

Desktop shows Activity as a right-side panel. Mobile shows Activity below the course grid.

Activity shows the latest additions with `addedAt` and Material updates with `updatedAt`, filtered to the selected academic year, study year, and semester.

## Course Details

Course detail pages show:

```text
Course title
Professors
About section
Tabs
```

The About section shows the Course description, Material Difficulty, Passing Difficulty, and a Grade Breakdown derived from known Assignment Deadline and Exam percentages. Assignment notes and exam notes are not repeated in About; they appear in the Assignments and Exams tabs through each item's description.

Material Difficulty and Passing Difficulty are color-coded status badges:

```text
easy -> green
medium -> amber
hard -> red
unknown -> neutral gray
```

Missing difficulty values should display as `unknown`.

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
Linked assignment materials
```

Assignment status is derived from `dueAt`, for example upcoming, due soon, or past.

Assignment suggestion and contribution forms use a multiselect for linked Materials and only list Materials with type `assignment`.

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
Description, when present
Location, when present
Grade weight
Linked exam materials
```

Exam suggestion and contribution forms use a multiselect for linked Materials and only list Materials with type `exam`.

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
