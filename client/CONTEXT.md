# UniHub

UniHub centralizes university course information that is otherwise scattered across multiple platforms.

## Language

**Course**:
A university class offering inside a specific semester. A course gathers the materials, deadlines, schedule information, and exam information for that semester instance.
_Avoid_: Class, subject

**Course Path**:
The hierarchy that identifies where a course belongs: academic year, study year, semester, and course identifier.
_Avoid_: Global course id

**Academic Year**:
The university year that contains study years, such as `2025-2026`.
_Avoid_: School year

**Study Year**:
The student's progression year within an academic year, such as year 1, year 2, or year 3.
_Avoid_: Year, cohort year

**Semester**:
A subdivision of a study year that groups the courses students take during that period.
_Avoid_: Term

**Calendar Event**:
A dated item shown on the calendar, derived from course data. Calendar events are assignment deadlines, exams, or course sessions.
_Avoid_: Event, reminder

**Assignment Deadline**:
The due date for course work that students are expected to submit. An assignment deadline may reference the materials needed to complete it and may count toward the course grade, but grading is optional.
_Avoid_: Homework, task

**Exam**:
A course assessment with a required grade weight. Its start date, location, and exam-specific notes may be announced later.
_Avoid_: Test, final

**Grade Weight**:
The numeric percentage an assignment deadline or exam counts toward the final course grade. Grade weights may exceed 100 when a professor's grading policy allows bonus or overweighted components.
_Avoid_: Exam type, partial

**Material Difficulty**:
The course-level estimate of how hard the learning materials are to understand and keep up with. It uses a small controlled vocabulary so it can be compared and color-coded consistently.
_Avoid_: Material rating, content difficulty

**Passing Difficulty**:
The course-level estimate of how hard it is to earn a passing grade in the course. It uses the same controlled vocabulary as Material Difficulty so it can be compared and color-coded consistently.
_Avoid_: Course difficulty, exam difficulty

**Material**:
A learning resource attached to a course. Materials have a type: course, seminar, lab, assignment, exam, video, or other.
_Avoid_: Resource, file

**Material Reference**:
A link from another course item to an existing material in the same course, using the material's identifier.
_Avoid_: Embedded material, duplicate link

**Activity**:
A feed item that highlights newly added course items and updated materials. Activity is derived from optional timestamps on course items and is not a general announcement system.
_Avoid_: Announcement, notification

**Course Session**:
A scheduled lecture for a course.
_Avoid_: Course date, class meeting

**Session Status**:
The lifecycle state of a course session. Sessions store `scheduled` or `cancelled`; `completed` is computed by the app when a scheduled session is in the past.
_Avoid_: Course status

**Contribution**:
A proposed change to the course information maintained in the repository. Contributions are reviewed by maintainers before becoming part of the canonical data.
_Avoid_: Submission, edit

**Suggestion**:
A student-facing request to add or correct course information. Suggestions become contributions when the app turns them into maintainer-reviewed repository changes.
_Avoid_: Contribution, report

**Maintainer**:
A person trusted to review and approve contributions before they are merged into the repository.
_Avoid_: Admin, moderator
