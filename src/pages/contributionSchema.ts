import type { ContributionType } from '@/domain'

export type SchemaField = {
  name: string
  type: string
  required: boolean
  description: string
  example: string
}

export const contributionSchemas: Record<ContributionType, SchemaField[]> = {
  'add-material': [
    { name: 'id', type: 'string', required: true, description: 'Unique lowercase identifier (e.g. "lecture-1-slides").', example: '"lecture-1-slides"' },
    { name: 'type', type: 'string', required: true, description: 'Type of resource: "course", "seminar", "lab", "assignment", "exam", "video", "other".', example: '"video"' },
    { name: 'title', type: 'string', required: true, description: 'Display name of the resource.', example: '"Lecture 1 Slides"' },
    { name: 'url', type: 'string', required: true, description: 'Full URL to the resource files.', example: '"https://example.edu/slides1.pdf"' },
    { name: 'addedAt', type: 'string', required: false, description: 'Optional ISO 8601 date-time string.', example: '"2026-06-30T11:23:45.000Z"' },
  ],
  'update-material': [
    { name: 'id', type: 'string', required: true, description: 'Existing Material identifier to update.', example: '"lecture-1-slides"' },
    { name: 'type', type: 'string', required: true, description: 'Updated resource type: "course", "seminar", "lab", "assignment", "exam", "video", "other".', example: '"video"' },
    { name: 'title', type: 'string', required: true, description: 'Updated display name of the resource.', example: '"Lecture 1 Recording"' },
    { name: 'url', type: 'string', required: true, description: 'Updated full URL to the resource files.', example: '"https://example.edu/lecture1.mp4"' },
    { name: 'updatedAt', type: 'string', required: false, description: 'Optional ISO 8601 date-time string for Activity.', example: '"2026-06-30T11:23:45.000Z"' },
  ],
  'add-assignment-deadline': [
    { name: 'id', type: 'string', required: true, description: 'Unique lowercase identifier (e.g. "assignment-1").', example: '"assignment-1"' },
    { name: 'title', type: 'string', required: true, description: 'Display title of the assignment.', example: '"Homework 1"' },
    { name: 'description', type: 'string', required: false, description: 'Optional detailed description/instructions.', example: '"Complete exercises 1-5."' },
    { name: 'dueAt', type: 'string', required: true, description: 'Due date and time in ISO 8601 format.', example: '"2026-11-01T21:59:00.000Z"' },
    { name: 'submissionUrl', type: 'string', required: false, description: 'Optional URL to submit/upload the work.', example: '"https://teams.microsoft.com/..."' },
    { name: 'gradeWeight', type: 'number', required: false, description: 'Optional percentage grade weight (0-100).', example: '10' },
    { name: 'materialIds', type: 'string[]', required: false, description: 'Optional array of material IDs linked to this assignment.', example: '["assignment-1-details"]' },
    { name: 'addedAt', type: 'string', required: false, description: 'Optional ISO date-time string.', example: '"2026-06-30T11:23:45.000Z"' },
  ],
  'add-exam': [
    { name: 'id', type: 'string', required: true, description: 'Unique lowercase identifier (e.g. "midterm").', example: '"midterm"' },
    { name: 'title', type: 'string', required: true, description: 'Exam name.', example: '"Midterm Exam"' },
    { name: 'startsAt', type: 'string', required: false, description: 'Optional exam date and time in ISO 8601 format.', example: '"2026-12-15T09:00:00.000Z"' },
    { name: 'gradeWeight', type: 'number', required: false, description: 'Optional percentage grade weight (0-100).', example: '30' },
    { name: 'materialIds', type: 'string[]', required: false, description: 'Optional array of material IDs linked to this exam.', example: '["midterm-sample-solutions"]' },
    { name: 'addedAt', type: 'string', required: false, description: 'Optional ISO date-time string.', example: '"2026-06-30T11:23:45.000Z"' },
  ],
  'add-course-session': [
    { name: 'id', type: 'string', required: true, description: 'Unique lowercase identifier (e.g. "lecture-1").', example: '"lecture-1"' },
    { name: 'title', type: 'string', required: true, description: 'Lecture/seminar title.', example: '"Introduction to Algorithms"' },
    { name: 'startsAt', type: 'string', required: true, description: 'Session start date and time in ISO 8601.', example: '"2026-10-05T08:00:00.000Z"' },
    { name: 'endsAt', type: 'string', required: true, description: 'Session end date and time in ISO 8601.', example: '"2026-10-05T10:00:00.000Z"' },
    { name: 'location', type: 'string', required: false, description: 'Optional room, building, or link.', example: '"Room 301"' },
    { name: 'status', type: 'string', required: true, description: 'Status of session: "scheduled" or "cancelled".', example: '"scheduled"' },
    { name: 'addedAt', type: 'string', required: false, description: 'Optional ISO date-time string.', example: '"2026-06-30T11:23:45.000Z"' },
  ],
  'edit-course-metadata': [
    { name: 'title', type: 'string', required: false, description: 'Optional new course title.', example: '"Algorithms & Data Structures"' },
    { name: 'professors', type: 'string[]', required: false, description: 'Optional updated list of professor names.', example: '["Dr. Jane Doe", "Prof. Smith"]' },
    { name: 'description', type: 'string', required: false, description: 'Optional updated course description.', example: '"An intro to complexity and structures."' },
  ],
  'add-new-course': [
    { name: 'id', type: 'string', required: true, description: 'Unique lowercase course identifier (e.g. "discrete-math").', example: '"discrete-math"' },
    { name: 'title', type: 'string', required: true, description: 'Full title of the new course.', example: '"Discrete Mathematics"' },
    { name: 'professors', type: 'string[]', required: true, description: 'List of professor names.', example: '["Prof. John Doe"]' },
    { name: 'description', type: 'string', required: false, description: 'Optional course description.', example: '"Introduction to logic, sets, and graphs."' },
    { name: 'materials', type: 'array', required: true, description: 'Must be empty array [].', example: '[]' },
    { name: 'assignmentDeadlines', type: 'array', required: true, description: 'Must be empty array [].', example: '[]' },
    { name: 'courseSessions', type: 'array', required: true, description: 'Must be empty array [].', example: '[]' },
    { name: 'exams', type: 'array', required: true, description: 'Must be empty array [].', example: '[]' },
  ],
}
