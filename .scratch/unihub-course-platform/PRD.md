# UniHub Course Platform PRD

Status: ready-for-agent

## Problem Statement

University students need course information to be centralized because materials, assignment deadlines, lecture schedules, and exams are currently scattered across different platforms. This creates friction, makes deadlines easier to miss, and forces students to repeatedly check multiple places for basic course information.

UniHub should give students one static, GitHub Pages-hosted place to browse Courses by Academic Year, Study Year, and Semester, inspect Course details, review a calendar agenda, and contribute missing information through maintainer-reviewed GitHub-native workflows.

## Solution

Build a static React application with a Microsoft Teams-inspired interface. The Home page lets students select an Academic Year, Study Year, and Semester, then view Course cards showing Course title and professors. Course detail pages expose Materials, Assignments, Lectures, and Exams as separate tabs. The Calendar page aggregates Calendar Events from Assignment Deadlines, Course Sessions, and Exams. The Contribute page guides users through one Contribution at a time and generates either a GitHub issue or pull request instructions for maintainer approval.

Canonical data lives as JSON in the repository. A catalog defines hierarchy labels and ordering, while each Course is stored as its own JSON file under a hierarchy-derived Course Path. Formal JSON Schema validation protects the app and the Contribution workflow from malformed data.

## User Stories

1. As a student, I want to select an Academic Year, so that I only see Course information relevant to that university year.
2. As a student, I want to select my Study Year, so that Courses for other years do not distract me.
3. As a student, I want to select a Semester, so that I can focus on the Courses I am currently taking.
4. As a student, I want the app to remember my selected Academic Year, Study Year, and Semester, so that I do not need to reselect them every visit.
5. As a student, I want to see Course cards in a Teams-like grid, so that the Home page feels familiar and easy to scan.
6. As a student, I want Course cards to show Course title and professors, so that I can identify the right Course quickly.
7. As a student, I want to open a Course from the Home page, so that I can inspect its Materials, Assignments, Lectures, and Exams.
8. As a student, I want Course details to show the Course title and professors, so that I know I am viewing the correct Course.
9. As a student, I want Course details split into tabs, so that Materials, Assignments, Lectures, and Exams are not mixed together.
10. As a student, I want Materials grouped by type, so that I can quickly find course, seminar, lab, and other general learning resources.
11. As a student, I want assignment-specific Materials shown with their Assignment Deadline, so that I can find the exact files needed for the work.
12. As a student, I want exam-specific Materials shown with their Exam, so that example exams and exam resources are easy to find.
13. As a student, I want Materials to support repository files and external links, so that the app can centralize resources regardless of where they are hosted.
14. As a student, I want Assignment Deadlines sorted by due date, so that I can see what needs attention first.
15. As a student, I want Assignment Deadlines to show due date, description, submission link, Grade Weight, and linked Materials when available, so that I know what to do and where to submit it.
16. As a student, I want Assignment Deadline status to be derived from its due date, so that I can distinguish upcoming, urgent, and past work.
17. As a student, I want Course Sessions listed as lectures with start time, end time, location, and status, so that I know when lectures happen.
18. As a student, I want cancelled Course Sessions to remain visible, so that cancellations are obvious rather than silently missing.
19. As a student, I want completed Course Sessions computed automatically, so that old scheduled lectures do not need manual status updates.
20. As a student, I want Exams listed separately from Assignments, so that assessments are not buried in a generic deadline list.
21. As a student, I want a Course to support multiple Exams, so that separate assessments can each have their own date and Grade Weight.
22. As a student, I want Exams to allow unknown dates, so that announced grading structure can still be shown before the schedule is final.
23. As a student, I want Exams to show only a start date/time when known, so that the app does not invent or require an end time.
24. As a student, I want a Grade Breakdown showing known Assignment Deadline and Exam Grade Weights, so that I understand how the final grade is composed.
25. As a student, I want incomplete Grade Weight information to be allowed, so that partially known grading rules can still be useful.
26. As a student, I want the app to warn visually when Grade Weight information is incomplete, so that I do not assume missing percentages are irrelevant.
27. As a student, I want an Activity panel on Home, so that newly added Course items are easy to notice.
28. As a student, I want Activity to include newly added Materials, Assignment Deadlines, Course Sessions, and Exams, so that recent additions across Courses are visible.
29. As a student, I want Activity filtered to my selected Academic Year, Study Year, and Semester, so that irrelevant updates are not shown.
30. As a student, I want Activity to show the latest items regardless of age, so that sparse semesters still show useful recent additions.
31. As a student, I want the Calendar page to show an agenda list, so that upcoming Assignment Deadlines, Course Sessions, and Exams are easy to scan.
32. As a student, I want Calendar filters for Academic Year, Study Year, Semester, Course, event type, and time range, so that I can narrow the agenda.
33. As a student, I want the Calendar to default to upcoming events for my selected context, so that I immediately see what matters next.
34. As a student, I want Calendar Events derived from Course data, so that deadlines and schedules do not need to be duplicated.
35. As a student, I want a mobile bottom navigation, so that Home, Calendar, and Contribute are easy to reach on a phone.
36. As a student, I want desktop navigation in a Teams-like app rail, so that the app feels familiar and organized.
37. As a contributor, I want to add one Contribution at a time, so that the process is focused and easy to complete.
38. As a contributor, I want to choose between creating a GitHub issue and opening a pull request, so that I can contribute at my comfort level.
39. As a contributor, I want to choose the target Academic Year, Study Year, Semester, and Course from existing data, so that I do not need to type a Course Path manually.
40. As a contributor, I want to add a new Course to a selected Academic Year, Study Year, and Semester, so that missing Courses can be introduced.
41. As a contributor, I want the UI to generate a target Course Path, so that maintainers know exactly where the Contribution belongs.
42. As a contributor, I want the UI to validate my Contribution before submission, so that I can fix problems before asking for review.
43. As a contributor, I want invalid data blocked, so that maintainers do not receive unusable Contributions.
44. As a contributor, I want incomplete but valid data allowed with warnings, so that real-world partial information can still be submitted.
45. As a contributor, I want the issue flow to include generated JSON and validation results, so that maintainers can review my Contribution efficiently.
46. As a contributor, I want the pull request flow to provide updated JSON, suggested title, suggested body, and edit/create links where possible, so that I can open a PR without understanding the whole repository.
47. As a maintainer, I want all Contributions reviewed before becoming canonical data, so that Course information remains trustworthy.
48. As a maintainer, I want Course data validated by schema, so that malformed JSON cannot break the static app.
49. As a maintainer, I want Course files split by Course, so that reviews and merge conflicts stay small.
50. As a maintainer, I want the folder hierarchy to define Academic Year, Study Year, and Semester, so that Course files stay concise and readable.
51. As a maintainer, I want a catalog to define labels and ordering, so that UI display order is explicit and not filesystem-dependent.
52. As a maintainer, I want local IDs scoped to their parent, so that data remains readable while the app can still derive globally unique keys.
53. As a maintainer, I want Assignment Deadline Material References to point to assignment Materials, so that assignment resources do not appear in the wrong tab.
54. As a maintainer, I want Exam Material References to point to exam Materials, so that exam resources do not appear in the wrong tab.
55. As a maintainer, I want Grade Weights above 100 blocked, so that impossible grading data cannot be merged.
56. As a maintainer, I want Grade Weights below 100 allowed with warnings, so that incomplete but accurate information can be published.
57. As a maintainer, I want Course Sessions stored explicitly rather than as recurrence rules, so that exceptions, cancellations, and one-off changes are unambiguous.
58. As a maintainer, I want React Router hash routing, so that direct links and refreshes work reliably on GitHub Pages.
59. As a maintainer, I want no account system or backend writes, so that the app remains deployable as static assets.
60. As a maintainer, I want the first version scoped tightly, so that search, dark mode, offline support, and announcements do not delay the core Course platform.

## Implementation Decisions

- Build the product as a static React application deployable on GitHub Pages.
- Use React Router with hash routing so GitHub Pages refreshes and direct links remain reliable.
- Use a Teams-inspired shell with desktop app rail navigation and mobile bottom navigation.
- Store the selected Academic Year, Study Year, and Semester in local browser storage.
- Model the navigation hierarchy as Academic Year, then Study Year, then Semester, then Course.
- Store labels and ordering in a catalog data contract.
- Store each Course as an individual JSON document and derive its Academic Year, Study Year, and Semester from its Course Path.
- Keep Course IDs unique within a Semester and Course item IDs unique within a Course.
- Load Course JSON from static repository data at build time and reconstruct the hierarchy in the app.
- Define formal JSON Schemas for catalog and Course data.
- Validate repository data during development/deployment and validate Contribution data in the browser.
- Use Material types: course, seminar, lab, assignment, exam, and other.
- Show only course, seminar, lab, and other Materials in the Materials tab.
- Show assignment Materials only through Assignment Deadlines.
- Show exam Materials only through Exams.
- Require Assignment Deadline Material References to point to assignment Materials.
- Require Exam Material References to point to exam Materials.
- Store Material links in a single location field that can be a local static asset path or an external URL.
- Require Assignment Deadlines to have a due datetime.
- Allow Assignment Deadlines to include description, submission URL, Grade Weight, Material References, and optional Activity timestamp.
- Allow a Course to have multiple Exams.
- Store Exams with optional start datetime, optional location, optional Grade Weight, Material References, and optional Activity timestamp.
- Do not store an Exam end time.
- Store Course Sessions as explicit lecture records rather than recurrence rules.
- Require Course Sessions to have start datetime, end datetime, and stored Session Status.
- Store Session Status as scheduled or cancelled; compute completed dynamically.
- Store location as a plain optional string for Course Sessions and Exams.
- Allow Assignment Deadlines and Exams to carry optional Grade Weight percentages.
- Allow incomplete Grade Weight totals with warnings; block totals above 100.
- Derive Calendar Events from Assignment Deadlines, Course Sessions, and Exams with known start datetimes.
- Use an agenda/list Calendar as the primary v1 calendar view.
- Provide Calendar filters for Academic Year, Study Year, Semester, Course, event type, and time range.
- Derive Activity from optional timestamps on Materials, Assignment Deadlines, Course Sessions, and Exams.
- Activity represents newly inserted items only, not updates or cancellations.
- Show latest Activity items regardless of age.
- Provide a Contribution page with one Contribution type at a time.
- Support Contribution types for adding Material, Assignment Deadline, Exam, Course Session, editing Course metadata, and adding a new Course.
- Let contributors choose between creating a GitHub issue and using an assisted pull request flow.
- In issue mode, generate a prefilled issue containing Contribution type, target Course Path, JSON, validation results, and warnings.
- In pull request mode, generate target Course Path, updated JSON or snippet, suggested title, suggested body, and GitHub edit/create link where possible.
- Require maintainer approval before Contributions become canonical data.
- Do not support one-click PR creation from the static app.

## Testing Decisions

- Prefer one high-level behavior seam: given fixture catalog and Course data, render the app and verify visible Home, Course detail, Calendar, Activity, and Contribution behavior from the user's perspective.
- Data loading tests should verify that catalog data and Course Path-derived Course files produce the expected Academic Year, Study Year, Semester, and Course hierarchy.
- Schema validation tests should verify valid Course and catalog data pass, while malformed data, duplicate local IDs, invalid Material References, invalid Session Status, impossible lecture times, missing Assignment Deadline due datetimes, and Grade Weight totals above 100 fail.
- Contribution workflow tests should verify invalid Contributions are blocked and incomplete-but-valid Contributions produce warnings.
- Contribution workflow tests should verify issue mode generates a maintainer-reviewable issue body with target Course Path, JSON, validation status, and warnings.
- Contribution workflow tests should verify pull request mode generates target Course Path, JSON, suggested title, suggested body, and available GitHub edit/create links.
- Home page tests should verify selectors drive the Course grid and that selected context is remembered locally.
- Home page tests should verify Course cards show Course title and professors only.
- Activity tests should verify Activity is derived from optional Activity timestamps, sorted newest first, filtered by selected context, and not generated from updates without new timestamps.
- Course detail tests should verify tabs separate Materials, Assignments, Lectures, and Exams.
- Materials tab tests should verify general Materials are grouped by type and assignment/exam Materials are excluded.
- Assignment tests should verify Assignment Deadlines show due date, Grade Weight when known, submission URL when present, and linked assignment Materials.
- Lecture tests should verify scheduled, cancelled, and computed completed states are displayed correctly.
- Exam tests should verify multiple Exams are supported, unknown dates are displayed as announced later, and linked exam Materials appear in the Exams tab.
- Calendar tests should verify Calendar Events are derived from Assignment Deadlines, Course Sessions, and Exams with known start datetimes, and that filters affect the agenda.
- Routing tests should verify hash routes work for Home, Calendar, Contribute, and Course detail routes.
- Responsive tests should verify desktop app rail navigation and mobile bottom navigation expose the same top-level pages.
- Tests should focus on external behavior and user-visible outcomes rather than implementation details such as component names or internal state shape.
- Prior art in the current codebase is minimal because the app is still a Vite/React scaffold, so new test seams should be introduced at app behavior and data contract boundaries.

## Out of Scope

- Search is out of scope for v1.
- Manual dark mode switching is out of scope for v1.
- PWA/offline support is out of scope for v1.
- Announcements are out of scope for v1.
- Account, login, or role management is out of scope for v1.
- Direct in-app writes to the repository are out of scope for v1.
- One-click pull request creation from the static app is out of scope for v1.
- Recurring Course Session rules are out of scope for v1.
- Structured professor profiles, emails, and profile links are out of scope for v1.
- Structured location modeling, maps, and room search are out of scope for v1.
- Whole-Course JSON editing as the normal Contribution path is out of scope for v1.
- BrowserRouter clean URLs with GitHub Pages fallback workaround are out of scope for v1.
- Calendar month grid is out of scope for v1.
- Updating Activity for changed or cancelled items is out of scope for v1.

## Further Notes

The PRD follows the domain glossary and ADRs created during product design. Important constraints are that UniHub remains static, GitHub-native, and maintainer-reviewed. The current application is still a small Vite/React scaffold, so most implementation work will create the first real product modules rather than modify established ones.

The product design docs contain additional detail for the data model, UI design, and Contribution workflow. Those docs should be treated as supporting context for agents implementing this PRD.
