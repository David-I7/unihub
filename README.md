# UniHub

UniHub is a static web platform for centralizing university course information in one place. It is designed for students who currently have to check multiple platforms for materials, assignment deadlines, lecture schedules, and exam details.

The app uses a Microsoft Teams-inspired layout and is intended to be deployed on GitHub Pages.

## What You Can Do

- Browse courses by academic year, study year, and semester.
- Open a course to view its materials, assignments, lectures, and exams.
- See assignment deadlines, lecture dates, and exam dates in a calendar agenda.
- Check recent activity for newly added course items.
- Contribute missing or corrected information through GitHub issues or pull requests.

## Course Pages

Each course page is organized into four sections:

- **Materials**: general course, seminar, lab, and other learning resources.
- **Assignments**: deadlines, descriptions, submission links, grade weights, and assignment materials.
- **Lectures**: scheduled, cancelled, and completed lecture sessions.
- **Exams**: exam dates when known, grade weights, locations, and exam materials.

Course cards on the home page show the course title and professor names.

## Calendar

The calendar is an agenda-style view of upcoming course events. It is generated from course data, so there is no separate calendar source to maintain.

Calendar events include:

- Assignment deadlines
- Lecture sessions
- Exams with known start dates

## Contributions

UniHub stores course information as JSON files in this repository. Because the site is static, the app does not write directly to the repository.

Contributors can use the contribution page to propose one change at a time:

- Add material
- Add assignment
- Add exam
- Add lecture
- Edit course metadata
- Add a new course

The contribution page validates the proposed data, then helps contributors either create a GitHub issue or prepare a pull request. Maintainers review and approve contributions before they become part of the official course data.

## Project Scope

The first version focuses on reliable course information and static deployment. It does not include accounts, search, announcements, offline support, a manual dark mode toggle, or direct in-app repository writes.

## For Maintainers

Product and architecture notes live in:

- `docs/product/data-model.md`
- `docs/product/ui-design.md`
- `docs/product/contribution-workflow.md`
- `docs/adr/`
- `CONTEXT.md`

Implementation work is tracked under `.scratch/unihub-course-platform/`.
