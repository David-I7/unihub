# Data Model

UniHub stores canonical course data as JSON in the repository. The app is static, so data is loaded from local files at build time and rendered in the browser.

## File Layout

Course files are split by course. The folder path is the source of hierarchy:

```text
src/data/catalog.json
src/data/2025-2026/year-1/semester-1/data-structures.json
src/data/2025-2026/year-1/semester-1/algebra.json
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
      "href": "/materials/2025-2026/year-1/semester-1/data-structures/lecture-1.pdf",
      "addedAt": "2026-03-01T12:00:00+02:00"
    },
    {
      "id": "lab-2-brief",
      "title": "Lab 2 Brief",
      "type": "assignment",
      "href": "https://example.com/lab-2.pdf"
    },
    {
      "id": "final-example-2025",
      "title": "Final Example Exam 2025",
      "type": "exam",
      "href": "/materials/2025-2026/year-1/semester-1/data-structures/final-example-2025.pdf"
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
other
```

The Materials tab shows only:

```text
course
seminar
lab
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

Assignments and exams may have `gradeWeight` as a percentage number. The schema allows incomplete grading data.

Validation should block totals above `100`, but totals below `100` are allowed with a warning.

## Activity

Activity is derived from optional `addedAt` timestamps on materials, assignment deadlines, lectures, and exams.

The activity bar shows the latest items with `addedAt`, sorted newest first. Activity represents newly inserted items only, not later changes or cancellations.

## Schema Validation

The repo should include formal JSON Schema files for catalog and course data:

```text
src/data/schema/catalog.schema.json
src/data/schema/course.schema.json
```

Schemas are used by CI/development validation and by the contribution UI before generating GitHub issues or pull request instructions.
