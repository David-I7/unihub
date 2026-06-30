import test from 'node:test'
import assert from 'node:assert/strict'
import {
  buildHierarchy,
  contributionPayloadFromText,
  courseDataFilePath,
  coursePathFromRepositoryPath,
  courseRoute,
  deriveCourseDetailView,
  deriveActivity,
  deriveCalendarEvents,
  loadRepositoryData,
  parseCourseRoute,
  prepareContribution,
  repositorySchema,
  selectedContextCourses,
  validateCatalog,
  validateCourse,
  validateRepository,
} from '../src/domain.js'

const context = {
  academicYearId: '2025-2026',
  studyYearId: 'year-2',
  semesterId: 'semester-1',
}

test('repository data validates and reconstructs Academic Year to Course hierarchy', () => {
  const { catalog, courses } = loadRepositoryData()
  const result = validateRepository(catalog, courses)
  const hierarchy = buildHierarchy(catalog, courses)

  assert.equal(result.valid, true)
  assert.equal(hierarchy.academicYears[0].label, '2025-2026')
  assert.equal(hierarchy.academicYears[0].studyYears[0].label, 'Study Year 2')
  assert.equal(hierarchy.academicYears[0].studyYears[0].semesters[0].label, 'Semester 1')
  assert.deepEqual(
    hierarchy.academicYears[0].studyYears[0].semesters[0].courses.map((course) => course.title),
    ['Algorithms', 'Databases'],
  )
})

test('schema validation rejects malformed catalog and Course data', () => {
  const badCatalog = validateCatalog({ academicYears: [{ id: '2025', label: '2025', order: 1 }] })
  assert.equal(badCatalog.valid, false)
  assert.match(badCatalog.errors.join('\n'), /studyYears/)

  const badCourse = validateCourse({
    id: 'broken',
    title: 'Broken Course',
    professors: [],
    materials: [
      { id: 'dup', type: 'course', title: 'Slides', url: 'x' },
      { id: 'wrong-kind', type: 'course', title: 'Wrong Reference Kind', url: 'x' },
    ],
    assignmentDeadlines: [{ id: 'dup', title: 'Missing Due Date', materialIds: ['wrong-kind'], gradeWeight: 80 }],
    courseSessions: [{ id: 'session', title: 'Backwards', startsAt: '2026-03-02T10:00:00Z', endsAt: '2026-03-02T09:00:00Z', status: 'moved' }],
    exams: [{ id: 'exam', title: 'Exam', materialIds: ['missing'], gradeWeight: 30 }],
  })

  assert.equal(badCourse.valid, false)
  assert.match(badCourse.errors.join('\n'), /Duplicate local id/)
  assert.match(badCourse.errors.join('\n'), /requires dueAt/)
  assert.match(badCourse.errors.join('\n'), /non-assignment Material/)
  assert.match(badCourse.errors.join('\n'), /ends before it starts/)
  assert.match(badCourse.errors.join('\n'), /invalid Session Status/)
  assert.match(badCourse.errors.join('\n'), /missing Material/)
  assert.match(badCourse.errors.join('\n'), /Grade Weight total cannot exceed 100/)
})

test('validation allows incomplete valid data with warnings', () => {
  const result = validateCourse({
    id: 'incomplete',
    title: 'Incomplete Course',
    professors: [],
    materials: [],
    assignmentDeadlines: [],
    courseSessions: [],
    exams: [{ id: 'exam-tba', title: 'Exam To Be Announced', gradeWeight: 40, materialIds: [] }],
  })

  assert.equal(result.valid, true)
  assert.match(result.warnings.join('\n'), /no professors/)
  assert.match(result.warnings.join('\n'), /no Materials/)
  assert.match(result.warnings.join('\n'), /date is to be announced/)
  assert.match(result.warnings.join('\n'), /below 100/)
})

test('Home selection filters Course cards and builds stable hash routes', () => {
  const { courses } = loadRepositoryData()
  const selected = selectedContextCourses(courses, context)

  assert.deepEqual(
    selected.map((course) => ({ title: course.title, professors: course.professors })),
    [
      { title: 'Algorithms', professors: ['Dr. Mara Ionescu'] },
      { title: 'Databases', professors: ['Prof. Andrei Pop'] },
    ],
  )
  assert.equal(courseRoute(selected[0].path), '#/courses/2025-2026/year-2/semester-1/algorithms')
  assert.deepEqual(parseCourseRoute('#/courses/2025-2026/year-2/semester-1/algorithms'), selected[0].path)
})

test('Course Path module derives routes and repository paths from one interface', () => {
  const path = coursePathFromRepositoryPath('./data/courses/2025-2026/year-2/semester-1/algorithms.json')

  assert.deepEqual(path, { ...context, courseId: 'algorithms' })
  assert.equal(courseRoute(path), '#/courses/2025-2026/year-2/semester-1/algorithms')
  assert.equal(courseDataFilePath(path), 'src/data/courses/2025-2026/year-2/semester-1/algorithms.json')
})

test('Course detail view concentrates tab display derivation', () => {
  const { courses } = loadRepositoryData()
  const course = courses.find((item) => item.id === 'algorithms')
  assert(course)

  const view = deriveCourseDetailView(course, Date.parse('2026-12-01T00:00:00Z'))

  assert.deepEqual(view.materialGroups.map((group) => group.type), ['course', 'seminar', 'lab', 'other'])
  assert(view.assignments.every((assignment) => assignment.status === 'completed'))
  assert(view.courseSessions.some((session) => session.status === 'cancelled'))
  assert(view.exams.some((exam) => exam.materials.every((material) => material.type === 'exam')))
  assert.equal(view.gradeBreakdown.total > 0, true)
})

test('Activity is derived from addedAt items, filtered by selected context, and sorted newest first', () => {
  const { courses } = loadRepositoryData()
  const activity = deriveActivity(courses, context)

  assert.equal(activity[0].text, 'Retake Exam Exam added for Algorithms')
  assert(activity.some((item) => item.text === 'Cancelled Recurrence Review Lecture added for Algorithms (cancelled)'))
  assert(activity.every((item) => !item.text.includes('Web Engineering')))
})

test('Calendar derives agenda events without a separate dataset', () => {
  const { courses } = loadRepositoryData()
  const allEvents = deriveCalendarEvents({
    courses,
    context,
    eventType: 'all',
    timeRange: 'all',
    now: new Date('2026-02-01T00:00:00Z'),
  })
  const assignmentEvents = deriveCalendarEvents({
    courses,
    context,
    eventType: 'assignment',
    timeRange: 'all',
    now: new Date('2026-02-01T00:00:00Z'),
  })

  assert(allEvents.some((event) => event.title === 'Graph Traversal Report' && event.status === 'due assignment'))
  assert(allEvents.some((event) => event.title === 'Cancelled Recurrence Review' && event.status === 'cancelled lecture'))
  assert(allEvents.some((event) => event.title === 'Midterm Exam'))
  assert(!allEvents.some((event) => event.title === 'Final Exam'))
  assert(assignmentEvents.every((event) => event.type === 'assignment'))
})

test('Contribution generation blocks errors and preserves warnings in issue and pull request modes', () => {
  const blocked = contributionPayloadFromText({
    type: 'add-assignment-deadline',
    mode: 'issue',
    path: { ...context, courseId: 'algorithms' },
    payloadText: JSON.stringify({ id: 'broken-assignment', title: 'Broken', materialIds: [] }),
  })
  assert.equal(blocked.valid, false)
  assert.match(blocked.errors.join('\n'), /requires dueAt/)

  const issue = contributionPayloadFromText({
    type: 'add-exam',
    mode: 'issue',
    path: { ...context, courseId: 'algorithms' },
    payloadText: JSON.stringify({ id: 'alg-extra-retake', title: 'Retake Exam', gradeWeight: 5, materialIds: ['alg-exam-01'] }),
  })
  assert.equal(issue.valid, true)
  assert.match(issue.issueBody ?? '', /Target Course Path: 2025-2026\/year-2\/semester-1\/algorithms/)
  assert.match(issue.issueBody ?? '', /date is to be announced/)
  assert.match(issue.issueUrl ?? '', /github.com/)

  const pullRequest = contributionPayloadFromText({
    type: 'add-material',
    mode: 'pull-request',
    path: { ...context, courseId: 'algorithms' },
    payloadText: JSON.stringify({ id: 'alg-other-01', type: 'other', title: 'Reading List', url: 'https://example.edu/readings' }),
  })
  assert.equal(pullRequest.valid, true)
  assert.match(pullRequest.prTitle ?? '', /add-material/)
  assert.match(pullRequest.prBody ?? '', /Reading List/)
  assert.match(pullRequest.githubLink ?? '', /github.com/)
})

test('Contribution preparation accepts explicit repository and GitHub adapters', () => {
  const repository = loadRepositoryData()
  const result = prepareContribution({
    repository,
    githubTarget: { owner: 'uni', repo: 'hub', branch: 'course-data' },
    draft: {
      type: 'add-material',
      mode: 'pull-request',
      path: { ...context, courseId: 'algorithms' },
      payloadText: JSON.stringify({ id: 'alg-reading-02', type: 'other', title: 'Extra Reading', url: 'https://example.edu/extra' }),
    },
  })

  assert.equal(result.valid, true)
  assert.match(result.githubLink ?? '', /github.com\/uni\/hub\/edit\/course-data/)
  assert.match(result.changedJson ?? '', /Extra Reading/)
})

test('repositorySchema exposes formal JSON Schema files', () => {
  assert.equal(repositorySchema.catalog.$schema, 'https://json-schema.org/draft/2020-12/schema')
  assert.deepEqual(repositorySchema.course.required, ['id', 'title', 'professors', 'materials', 'assignmentDeadlines', 'courseSessions', 'exams'])
})
