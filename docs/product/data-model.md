# Data Model

UniHub stores canonical course data as JSON in the repository under `public/data`. The app is static, so catalog and course data are available as deployed static assets and can be fetched by the browser.

## File Layout

Course files are split by course. The folder path is the source of hierarchy:

```text
public/data/catalog.json
public/data/courses/2025-2026/year-1/semester-1/data-structures.json
public/data/courses/2025-2026/year-1/semester-1/algebra.json
```

`catalog.json` defines labels and ordering for the navigable hierarchy:

```json
{
  "academicYears": [
    {
      "id": "2025-2026",
      "label": "2025-2026",
      "studyYears": [
        {
          "id": "year-1",
          "label": "Year 1",
          "semesters": [
            {
              "id": "semester-1",
              "label": "Semester 1"
            }
          ]
        }
      ]
    }
  ]
}
```

The app reconstructs:

```text
Academic Year -> Study Year -> Semester -> Course
```

from `catalog.json` and the course file paths.

## Course File

Course IDs are unique within their semester. Material, assignment, exam, and lecture IDs are unique within their course.

```json
{
  "id": "data-structures",
  "title": "Data Structures",
  "professors": ["Dr. Ana Popescu", "Dr. Mihai Ionescu"],
  "description": "Optional course description.",
  "materials": [
    {
      "id": "lecture-1-slides",
      "title": "Lecture 1 Slides",
      "type": "course",
      "url": "/materials/2025-2026/year-1/semester-1/data-structures/lecture-1.pdf",
      "addedAt": "2026-03-01T12:00:00+02:00",
      "updatedAt": "2026-03-04T12:00:00+02:00"
    },
    {
      "id": "lab-2-brief",
      "title": "Lab 2 Brief",
      "type": "assignment",
      "url": "https://example.com/lab-2.pdf"
    },
    {
      "id": "final-example-2025",
      "title": "Final Example Exam 2025",
      "type": "exam",
      "url": "/materials/2025-2026/year-1/semester-1/data-structures/final-example-2025.pdf"
    },
    {
      "id": "lecture-1-recording",
      "title": "Lecture 1 Recording",
      "type": "video",
      "url": "https://example.com/lecture-1"
    }
  ],
  "assignmentDeadlines": [
    {
      "id": "lab-2",
      "title": "Lab 2",
      "dueAt": "2026-03-18T23:59:00+02:00",
      "description": "Submit the completed lab report as a PDF.",
      "submissionUrl": "https://example.com/submit",
      "gradeWeight": 20,
      "materialIds": ["lab-2-brief"],
      "addedAt": "2026-03-10T09:00:00+02:00"
    }
  ],
  "sessions": [
    {
      "id": "lecture-1",
      "title": "Lecture 1",
      "startsAt": "2026-03-02T10:00:00+02:00",
      "endsAt": "2026-03-02T12:00:00+02:00",
      "location": "Room A101",
      "status": "scheduled"
    }
  ],
  "exams": [
    {
      "id": "final-exam",
      "title": "Final Exam",
      "startsAt": "2026-06-12T09:00:00+03:00",
      "location": "Exam Hall 1",
      "gradeWeight": 80,
      "materialIds": ["final-example-2025"]
    }
  ]
}
```

## Material Types

Allowed material types:

```text
course
seminar
lab
assignment
exam
video
other
```

The Materials tab shows only:

```text
course
seminar
lab
video
other
```

Assignment materials are shown through assignments. Exam materials are shown through exams.

Validation must require assignment `materialIds` to reference `assignment` materials and exam `materialIds` to reference `exam` materials.

## Timing

Assignments require `dueAt` as an ISO datetime with offset.

Lectures require `startsAt` and `endsAt` as ISO datetimes with offsets. `endsAt` must be after `startsAt`.

Exams may omit `startsAt` when the date is not announced. Exams do not have `endsAt`.

The app displays datetimes as represented by the stored values and should not introduce a separate fixed university timezone.

## Status

Lecture status is stored as:

```text
scheduled
cancelled
```

`completed` is computed dynamically when a scheduled lecture has an `endsAt` in the past.

## Grade Weights

Assignments and exams may have `gradeWeight` as a percentage number. Grade weights may exceed `100` when the professor's grading policy allows it. The schema allows incomplete grading data.

Validation should not block totals above `100`. Totals below `100` are allowed with a warning because they may indicate incomplete grading data.

## Activity

Activity is derived from optional `addedAt` timestamps on materials, assignment deadlines, lectures, and exams, plus optional `updatedAt` timestamps on materials.

The activity bar shows the latest additions and material updates, sorted newest first by the relevant activity timestamp. Material updates should appear as updates rather than as newly added items.

When an existing material changes, maintainers should set or replace the material's `updatedAt` timestamp. `updatedAt` is only for changes to existing materials; new materials use `addedAt`.

## Data Validation

The repo validates catalog data, course data, and contribution payloads with zod schemas. The same validation rules are used by CI/development checks and by the contribution UI before generating GitHub issues or pull request instructions. Zod owns runtime validation; existing TypeScript domain types may remain unless schema inference clearly reduces duplication. After equivalent zod schemas are in place and tests pass, legacy JSON Schema files should be removed so there is only one validation source.
