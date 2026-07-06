# UniHub Backend

UniHub centralizes university course information through authenticated, permissioned course collaboration and notification workflows.

## Language

**User**:
A person with an account in UniHub. Users may read course information by default and may receive additional role-based permissions.
_Avoid_: Account

**Login Method**:
The way a user authenticates with UniHub. UniHub supports first-party email/password login and Google OAuth2 login.
_Avoid_: Auth provider

**User Identity**:
A login identity linked to a UniHub user, such as an email/password identity or a Google OAuth2 subject.
_Avoid_: Duplicate account, provider account

**Refresh Token**:
A server-tracked credential used to renew a user's access token without requiring the user to log in again.
_Avoid_: Session cookie, API token

**Admin**:
A user with system-wide authority across all series, courses, materials, professors, reviews, and permissions.
_Avoid_: Superuser

**Series**:
A student cohort and program track that progresses through multiple study years together, such as `Computer Science 2025-2028`. A series is the main scope for contributor permissions and course-material notifications.
_Avoid_: Academic year, study year, generation

**Study Year**:
A numbered progression year inside a series, such as year 1, year 2, or year 3.
_Avoid_: Academic year, cohort year

**Semester**:
A subdivision of a study year that groups the courses taught during that period.
_Avoid_: Term

**Course**:
A university class offering inside a specific semester. A course gathers professors, materials, deadlines, exams, and lecture sessions for that semester instance.
_Avoid_: Class, subject

**Series Representative**:
A user trusted to manage one or more specific series. Series representatives can create study years, semesters, courses, professors, and contributor invitations inside their assigned series.
_Avoid_: Series admin, representative, reprezentant

**Contributor**:
A user trusted to add or modify course information inside one or more specific series. Contributors may leave professor reviews when they are associated with a course taught by that professor.
_Avoid_: Editor, maintainer

**Access Request**:
A user's database-tracked request to receive a scoped UniHub role. Series representative requests are reviewed by admins, while contributor requests are reviewed by admins or series representatives for the target series.
_Avoid_: Permission email, role request

**Access Request Status**:
The lifecycle state of an access request: pending, approved, rejected, or cancelled.
_Avoid_: Request state

**Invitation**:
A database-tracked offer from an admin or series representative for an existing user to become a contributor in a target series.
_Avoid_: Invite email, access request

**Role Grant Authority**:
The rule that admins can grant any UniHub role, while series representatives can only invite contributors inside their own series.
_Avoid_: Permission delegation

**Invitation Status**:
The lifecycle state of an invitation: pending, accepted, declined, expired, or cancelled.
_Avoid_: Invite state

**Professor**:
A teacher profile reused across UniHub courses. A professor profile aggregates the courses they teach, student reviews, and rating statistics.
_Avoid_: Teacher, lecturer

**Course Professor**:
The association that says a professor teaches a course. A course may have multiple professors and a professor may teach multiple courses.
_Avoid_: Teaching role, lecturer assignment

**Professor Review**:
A contributor-authored evaluation of a professor in the context of a course taught by that professor.
_Avoid_: Feedback, teacher review

**Professor Rating Dimension**:
One of the numeric dimensions a professor review scores: overall rating, teaching quality, course material quality, communication, or fairness.
_Avoid_: Rating category, score type

**Professor Rating Summary**:
The derived aggregate statistics shown on a professor profile, including rating averages and review counts.
_Avoid_: Cached review, profile score

**Review Eligibility**:
The rule that allows a contributor to review a professor only through a course in one of the contributor's series, when that professor teaches the course.
_Avoid_: Enrollment, attendance proof

**Review Uniqueness**:
The rule that one contributor may have only one active review for the same professor and course pair.
_Avoid_: Duplicate review

**Material**:
A learning resource link attached to a course. Materials have a type such as course, seminar, lab, assignment, exam, video, or other.
_Avoid_: Resource, file, upload

**Material Change**:
An audit record that a material was added, updated, or deleted. Material changes store event metadata for notification and audit purposes, not full version history.
_Avoid_: Material version, diff

**Activity**:
A global app-generated event that can be shown in the in-app activity feed and filtered by time or type. Activity includes course additions, material additions, material changes, and due reminder events.
_Avoid_: Notification, inbox item

**Reminder Activity**:
A global activity created when an exam, deadline, or lecture reminder becomes due for a specific delivery schedule.
_Avoid_: Reminder notification, scheduled notification

**Notification Subscription**:
A user's rule for receiving email notifications about a specific scope, event type, and delivery schedule.
_Avoid_: Notification setting, alert rule

**Notification**:
A user-specific in-app inbox item derived from activity. Notifications are outside the first backend version and are only needed if UniHub supports per-user inbox state.
_Avoid_: Activity, event

**Notification Scope**:
The object boundary a notification subscription watches. UniHub supports series-level and course-level notification scopes.
_Avoid_: Material notification, watch target

**Notification Event Type**:
The kind of event a notification subscription watches. UniHub supports exam reminders, deadline reminders, lecture reminders, course additions, material changes, and material additions; course additions are available only for series-level subscriptions.
_Avoid_: Alert type, notification kind

**Delivery Schedule**:
The timing rule for when a notification should be sent. UniHub supports immediate, one day before, one week before, and one month before.
_Avoid_: Digest frequency, cadence

**Notification Schedule Compatibility**:
The rule that change events use immediate delivery, while reminder events use relative delivery before the scheduled date. Course additions, material changes, and material additions can only be immediate; exam reminders, deadline reminders, and lecture reminders can only be one day before, one week before, or one month before.
_Avoid_: Notification frequency
