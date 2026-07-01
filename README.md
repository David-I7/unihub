# UniHub

UniHub brings university course information into one place, so students do not have to jump between platforms to find materials, deadlines, lectures, and exam details.

It is a static GitHub Pages app with a compact academic dashboard layout.

## What You Can Do

- Browse courses by academic year, study year, and semester.
- Open a course to view its materials, assignments, lectures, and exams.
- Use the calendar to see upcoming assignments, lectures, and exams.
- Check recent activity for new course items and updated materials.
- Suggest missing or corrected course information for maintainer review.

## Course Pages

Each course page is organized around the things students usually need:

- **Materials**: course, seminar, lab, video, and other learning resources.
- **Assignments**: deadlines, descriptions, submission links, grade weights, and related materials.
- **Lectures**: scheduled, cancelled, and completed sessions.
- **Exams**: exam dates when known, grade weights, locations, and related materials.

If something looks missing or wrong, start from the relevant course section and use **Suggest update**.

## Calendar

The calendar is an agenda-style view generated from course data. It shows:

- Assignment deadlines.
- Lecture sessions.
- Exams with known dates.

There is no separate calendar database to maintain. Fix the course data, and the calendar follows.

## Suggestions And Contributions

UniHub stores course information as JSON files under `public/data`. Because the app is static, it does not write directly to the repository.

For normal student fixes, use **Suggest update** from a course page. UniHub will prepare a GitHub issue for maintainer review.

The **Contribute** page stays available for maintainers and advanced contributors who need to prepare repository-level changes, GitHub issues, or pull request content. It supports:

- Add material
- Update material
- Add assignment
- Add exam
- Add lecture
- Edit course metadata
- Add a new course

Maintainers review suggestions and contributions before they become part of the official course data.

## Project Scope

The first version focuses on reliable course information and static deployment. It does not include accounts, search, announcements, offline support, in-app suggestion status tracking, or direct in-app repository writes.

## For Maintainers

Useful docs:

- `docs/product/data-model.md`
- `docs/product/ui-design.md`
- `docs/product/contribution-workflow.md`
- `docs/adr/`
- `CONTEXT.md`

Implementation work is tracked as local markdown under `.scratch/`.
