# Backend Database Schema

This schema uses UUID primary keys for main domain tables and Postgres enums or check constraints for controlled values.

## Users and Authentication

### `users`

- `id uuid primary key`
- `email text not null unique`
- `display_name text not null`
- `password_hash text null`
- `global_role text not null` -- `USER`, `ADMIN`
- `created_at timestamptz not null`
- `updated_at timestamptz not null`

### `user_identities`

- `id uuid primary key`
- `user_id uuid not null references users(id)`
- `provider text not null` -- `LOCAL`, `GOOGLE`
- `provider_subject text null`
- `email_at_provider text not null`
- `created_at timestamptz not null`

Unique constraints:

- `(provider, provider_subject)` where `provider_subject is not null`
- `(user_id, provider)`

### `refresh_tokens`

- `id uuid primary key`
- `user_id uuid not null references users(id)`
- `token_hash text not null unique`
- `expires_at timestamptz not null`
- `revoked_at timestamptz null`
- `replaced_by_token_id uuid null references refresh_tokens(id)`
- `created_at timestamptz not null`

## Course Structure

### `series`

- `id uuid primary key`
- `name text not null`
- `start_year int not null`
- `end_year int not null`
- `created_at timestamptz not null`
- `updated_at timestamptz not null`

### `study_years`

- `id uuid primary key`
- `series_id uuid not null references series(id)`
- `year_number int not null`
- `created_at timestamptz not null`
- `updated_at timestamptz not null`

Unique constraint:

- `(series_id, year_number)`

### `semesters`

- `id uuid primary key`
- `study_year_id uuid not null references study_years(id)`
- `semester_number int not null`
- `created_at timestamptz not null`
- `updated_at timestamptz not null`

Unique constraint:

- `(study_year_id, semester_number)`

### `courses`

- `id uuid primary key`
- `semester_id uuid not null references semesters(id)`
- `name text not null`
- `description text null`
- `created_by_user_id uuid not null references users(id)`
- `created_at timestamptz not null`
- `updated_at timestamptz not null`

## Permissions

### `series_memberships`

- `id uuid primary key`
- `user_id uuid not null references users(id)`
- `series_id uuid not null references series(id)`
- `role text not null` -- `SERIES_REPRESENTATIVE`, `CONTRIBUTOR`
- `created_by_user_id uuid null references users(id)`
- `created_at timestamptz not null`

Unique constraint:

- `(user_id, series_id, role)`

Authorization rule:

- `ADMIN` is stored on `users.global_role`.
- Series-scoped roles are stored in `series_memberships`.
- A series representative can invite contributors only inside their own series.

### `access_requests`

- `id uuid primary key`
- `requester_user_id uuid not null references users(id)`
- `target_series_id uuid null references series(id)`
- `requested_role text not null` -- `SERIES_REPRESENTATIVE`, `CONTRIBUTOR`
- `status text not null` -- `PENDING`, `APPROVED`, `REJECTED`, `CANCELLED`
- `reviewed_by_user_id uuid null references users(id)`
- `reviewed_at timestamptz null`
- `created_at timestamptz not null`

### `invitations`

- `id uuid primary key`
- `invited_user_id uuid not null references users(id)`
- `target_series_id uuid not null references series(id)`
- `role text not null` -- `CONTRIBUTOR`
- `status text not null` -- `PENDING`, `ACCEPTED`, `DECLINED`, `EXPIRED`, `CANCELLED`
- `invited_by_user_id uuid not null references users(id)`
- `expires_at timestamptz not null`
- `accepted_at timestamptz null`
- `created_at timestamptz not null`

## Professors and Reviews

### `professors`

- `id uuid primary key`
- `name text not null`
- `bio text null`
- `overall_rating_avg numeric(3,2) null`
- `overall_rating_count int not null default 0`
- `teaching_quality_avg numeric(3,2) null`
- `course_material_quality_avg numeric(3,2) null`
- `communication_avg numeric(3,2) null`
- `fairness_avg numeric(3,2) null`
- `created_by_user_id uuid not null references users(id)`
- `created_at timestamptz not null`
- `updated_at timestamptz not null`

### `course_professors`

- `course_id uuid not null references courses(id)`
- `professor_id uuid not null references professors(id)`
- `primary key (course_id, professor_id)`

### `professor_reviews`

- `id uuid primary key`
- `professor_id uuid not null references professors(id)`
- `course_id uuid not null references courses(id)`
- `user_id uuid not null references users(id)`
- `overall_rating int not null check (overall_rating between 1 and 5)`
- `teaching_quality int not null check (teaching_quality between 1 and 5)`
- `course_material_quality int not null check (course_material_quality between 1 and 5)`
- `communication int not null check (communication between 1 and 5)`
- `fairness int not null check (fairness between 1 and 5)`
- `comment text null`
- `created_at timestamptz not null`
- `updated_at timestamptz not null`

Unique constraint:

- `(user_id, professor_id, course_id)`

## Course Items

### `materials`

- `id uuid primary key`
- `course_id uuid not null references courses(id)`
- `type text not null` -- `COURSE`, `SEMINAR`, `LAB`, `ASSIGNMENT`, `EXAM`, `VIDEO`, `OTHER`
- `title text not null`
- `url text not null`
- `description text null`
- `created_by_user_id uuid not null references users(id)`
- `updated_by_user_id uuid null references users(id)`
- `created_at timestamptz not null`
- `updated_at timestamptz not null`

### `material_changes`

- `id uuid primary key`
- `material_id uuid null references materials(id)`
- `course_id uuid not null references courses(id)`
- `changed_by_user_id uuid not null references users(id)`
- `change_type text not null` -- `ADDED`, `UPDATED`, `DELETED`
- `summary text null`
- `created_at timestamptz not null`

### `assignment_deadlines`

- `id uuid primary key`
- `course_id uuid not null references courses(id)`
- `title text not null`
- `due_at timestamptz not null`
- `description text null`
- `created_by_user_id uuid not null references users(id)`
- `created_at timestamptz not null`
- `updated_at timestamptz not null`

### `exams`

- `id uuid primary key`
- `course_id uuid not null references courses(id)`
- `title text not null`
- `starts_at timestamptz not null`
- `location text null`
- `notes text null`
- `created_by_user_id uuid not null references users(id)`
- `created_at timestamptz not null`
- `updated_at timestamptz not null`

### `lecture_sessions`

- `id uuid primary key`
- `course_id uuid not null references courses(id)`
- `title text not null`
- `starts_at timestamptz not null`
- `location text null`
- `notes text null`
- `created_by_user_id uuid not null references users(id)`
- `created_at timestamptz not null`
- `updated_at timestamptz not null`

## Activity and Email Notification Subscriptions

### `activities`

- `id uuid primary key`
- `event_type text not null` -- `EXAM_REMINDER`, `DEADLINE_REMINDER`, `LECTURE_REMINDER`, `COURSE_ADDED`, `MATERIAL_CHANGED`, `MATERIAL_ADDED`
- `scope_type text not null` -- `SERIES`, `COURSE`
- `series_id uuid not null references series(id)`
- `course_id uuid null references courses(id)`
- `source_type text not null` -- `EXAM`, `DEADLINE`, `LECTURE_SESSION`, `COURSE`, `MATERIAL`
- `source_id uuid not null`
- `delivery_schedule text null` -- `IMMEDIATE`, `ONE_DAY_BEFORE`, `ONE_WEEK_BEFORE`, `ONE_MONTH_BEFORE`
- `title text not null`
- `body text null`
- `created_at timestamptz not null`

Suggested unique constraint for reminder idempotency:

- `(event_type, source_type, source_id, delivery_schedule)`

### `notification_subscriptions`

- `id uuid primary key`
- `user_id uuid not null references users(id)`
- `scope_type text not null` -- `SERIES`, `COURSE`
- `series_id uuid null references series(id)`
- `course_id uuid null references courses(id)`
- `event_type text not null`
- `delivery_schedule text not null`
- `created_at timestamptz not null`

Validation rules:

- `scope_type = SERIES` requires `series_id` and forbids `course_id`.
- `scope_type = COURSE` requires `course_id`; `series_id` may be denormalized for faster matching.
- `COURSE_ADDED` is only valid when `scope_type = SERIES`.
- `COURSE_ADDED`, `MATERIAL_CHANGED`, and `MATERIAL_ADDED` require `IMMEDIATE`.
- `EXAM_REMINDER`, `DEADLINE_REMINDER`, and `LECTURE_REMINDER` require `ONE_DAY_BEFORE`, `ONE_WEEK_BEFORE`, or `ONE_MONTH_BEFORE`.

Unique constraint:

- `(user_id, scope_type, coalesce(series_id, course_id), event_type, delivery_schedule)`
