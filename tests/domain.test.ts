import { createRequire } from 'module'
declare global {
  var nodeRequire: ((id: string) => unknown) | undefined
}
globalThis.nodeRequire = createRequire(import.meta.url)

import test from 'node:test'
import assert from 'node:assert/strict'
import {
  buildHierarchy,
  courseDataFilePath,
  coursePathFromRepositoryPath,
  courseRoute,
  deriveCourseDetailView,
  deriveActivity,
  deriveCalendarEvents,
  loadRepositoryData,
  parseCourseRoute,
  prepareGeneratedContribution,
  prepareContribution,
  repositorySchema,
  selectedContextCourses,
  validateCatalog,
  validateCourse,
  validateRepository,
  prepareSuggestion,
  suggestionIntentsForSection,
} from '../src/domain/index.js'

const testDataRoot = 'tests/data'

const context = {
  academicYearId: '2025-2026',
  studyYearId: 'year-2',
  semesterId: 'semester-1',
}

function loadTestRepositoryData() {
  return loadRepositoryData(testDataRoot)
}

test('repository data validates and reconstructs Academic Year to Course hierarchy', () => {
  const { catalog, courses } = loadTestRepositoryData()
  const result = validateRepository(catalog, courses)
  const hierarchy = buildHierarchy(catalog, courses)

  assert.equal(result.valid, true)
  assert.equal(hierarchy.academicYears[0].label, '2025-2026')
  assert.equal(hierarchy.academicYears[0].studyYears[0].label, 'Study Year 1')
  assert.equal(hierarchy.academicYears[0].studyYears[0].semesters[0].label, 'Semester 1')
  assert.deepEqual(
    hierarchy.academicYears[0].studyYears[0].semesters[0].courses.map((course) => course.title),
    ['Structuri algebrice in informatica'],
  )
  assert.equal(hierarchy.academicYears[0].studyYears[1].label, 'Study Year 2')
  assert.equal(hierarchy.academicYears[0].studyYears[1].semesters[0].label, 'Semester 1')
  assert.deepEqual(
    hierarchy.academicYears[0].studyYears[1].semesters[0].courses.map((course) => course.title),
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
      { id: 'dup', type: 'course', title: 'Slides', url: 'https://example.edu/slides', addedAt: '2026-02-01T00:00:00.000Z', updatedAt: '2026-02-01T00:00:00.000Z' },
      { id: 'wrong-kind', type: 'course', title: 'Wrong Reference Kind', url: 'https://example.edu/wrong', addedAt: '2026-02-01T00:00:00.000Z', updatedAt: '2026-02-01T00:00:00.000Z' },
    ],
    assignmentDeadlines: [{ id: 'dup', title: 'Missing Due Date', materialIds: ['wrong-kind'], gradeWeight: 80, addedAt: '2026-02-01T00:00:00.000Z', updatedAt: '2026-02-01T00:00:00.000Z' }],
    courseSessions: [{ id: 'session', title: 'Backwards', startsAt: '2026-03-02T10:00:00Z', endsAt: '2026-03-02T09:00:00Z', status: 'moved', addedAt: '2026-02-01T00:00:00.000Z', updatedAt: '2026-02-01T00:00:00.000Z' }],
    exams: [{ id: 'exam', title: 'Exam', materialIds: ['missing'], gradeWeight: 30, addedAt: '2026-02-01T00:00:00.000Z', updatedAt: '2026-02-01T00:00:00.000Z' }],
  })

  assert.equal(badCourse.valid, false)
  assert.match(badCourse.errors.join('\n'), /Duplicate local id/)
  assert.match(badCourse.errors.join('\n'), /requires dueAt/)
  assert.match(badCourse.errors.join('\n'), /non-assignment Material/)
  assert.match(badCourse.errors.join('\n'), /ends before it starts/)
  assert.match(badCourse.errors.join('\n'), /invalid Session Status/)
  assert.match(badCourse.errors.join('\n'), /missing Material/)
  assert.doesNotMatch(badCourse.errors.join('\n'), /Grade Weight total cannot exceed 100/)
})

test('Course item validation requires timestamps and external Material URLs', () => {
  const missingTimestamp = validateCourse({
    id: 'broken',
    title: 'Broken Course',
    professors: ['Prof. Ada'],
    materials: [{ id: 'slides', type: 'course', title: 'Slides', url: 'https://example.edu/slides', addedAt: '2026-02-01T00:00:00.000Z' }],
    assignmentDeadlines: [],
    courseSessions: [],
    exams: [],
  })
  const localUrl = validateCourse({
    id: 'broken',
    title: 'Broken Course',
    professors: ['Prof. Ada'],
    materials: [{ id: 'slides', type: 'course', title: 'Slides', url: './slides.pdf', addedAt: '2026-02-01T00:00:00.000Z', updatedAt: '2026-02-01T00:00:00.000Z' }],
    assignmentDeadlines: [],
    courseSessions: [],
    exams: [],
  })

  assert.equal(missingTimestamp.valid, false)
  assert.match(missingTimestamp.errors.join('\n'), /slides requires updatedAt/)
  assert.equal(localUrl.valid, false)
  assert.match(localUrl.errors.join('\n'), /external URL/)
})

test('validation allows incomplete valid data with warnings', () => {
  const result = validateCourse({
    id: 'incomplete',
    title: 'Incomplete Course',
    professors: [],
    materials: [],
    assignmentDeadlines: [],
    courseSessions: [],
    exams: [{ id: 'exam-tba', title: 'Exam To Be Announced', gradeWeight: 40, materialIds: [], addedAt: '2026-02-01T00:00:00.000Z', updatedAt: '2026-02-01T00:00:00.000Z' }],
  })

  assert.equal(result.valid, true)
  assert.match(result.warnings.join('\n'), /no professors/)
  assert.match(result.warnings.join('\n'), /no Materials/)
  assert.match(result.warnings.join('\n'), /date is to be announced/)
  assert.match(result.warnings.join('\n'), /below 100/)
})

test('validation accepts Grade Weight totals above 100 while warning below 100 totals', () => {
  const overweight = validateCourse({
    id: 'overweight',
    title: 'Overweight Course',
    professors: ['Prof. Ada'],
    materials: [],
    assignmentDeadlines: [{ id: 'assignment', title: 'Assignment', dueAt: '2026-03-15T21:59:00.000Z', gradeWeight: 80, addedAt: '2026-02-01T00:00:00.000Z', updatedAt: '2026-02-01T00:00:00.000Z' }],
    courseSessions: [],
    exams: [{ id: 'exam', title: 'Exam', startsAt: '2026-04-20T09:00:00.000Z', gradeWeight: 40, addedAt: '2026-02-01T00:00:00.000Z', updatedAt: '2026-02-01T00:00:00.000Z' }],
  })
  const incomplete = validateCourse({
    id: 'incomplete-weights',
    title: 'Incomplete Weights',
    professors: ['Prof. Ada'],
    materials: [],
    assignmentDeadlines: [{ id: 'assignment', title: 'Assignment', dueAt: '2026-03-15T21:59:00.000Z', gradeWeight: 40, addedAt: '2026-02-01T00:00:00.000Z', updatedAt: '2026-02-01T00:00:00.000Z' }],
    courseSessions: [],
    exams: [],
  })

  assert.equal(overweight.valid, true)
  assert.doesNotMatch(overweight.errors.join('\n'), /Grade Weight total cannot exceed 100/)
  assert.equal(incomplete.valid, true)
  assert.match(incomplete.warnings.join('\n'), /below 100/)
})

test('Home selection filters Course cards and builds stable hash routes', () => {
  const { courses } = loadTestRepositoryData()
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
  const path = coursePathFromRepositoryPath(`./${testDataRoot}/courses/2025-2026/year-2/semester-1/algorithms.json`)

  assert.deepEqual(path, { ...context, courseId: 'algorithms' })
  assert.equal(courseRoute(path), '#/courses/2025-2026/year-2/semester-1/algorithms')
  assert.equal(courseDataFilePath(path), 'public/data/courses/2025-2026/year-2/semester-1/algorithms.json')
})

test('Course detail view concentrates tab display derivation', () => {
  const { courses } = loadTestRepositoryData()
  const course = courses.find((item) => item.id === 'algorithms')
  assert(course)

  const view = deriveCourseDetailView(course, Date.parse('2026-12-01T00:00:00Z'))

  assert.deepEqual(view.materialGroups.map((group) => group.type), ['course', 'lab'])
  assert(view.assignments.every((assignment) => assignment.status === 'completed'))
  assert(view.courseSessions.some((session) => session.status === 'cancelled'))
  assert(view.exams.some((exam) => exam.materials.every((material) => material.type === 'exam')))
  assert.equal(view.gradeBreakdown.total > 0, true)
})

test('video Materials validate and appear with general Course detail Materials', () => {
  const { courses } = loadTestRepositoryData()
  const course = courses.find((item) => item.id === 'algorithms')
  assert(course)
  const courseWithVideo = {
    ...course,
    materials: [
      ...course.materials,
      { id: 'alg-video-01', type: 'video' as const, title: 'Lecture Recording', url: 'https://example.edu/recording', addedAt: '2026-10-20T10:00:00Z', updatedAt: '2026-10-20T10:00:00Z' },
    ],
  }

  const result = validateCourse(courseWithVideo)
  const invalidType = validateCourse({
    ...course,
    materials: [...course.materials, { id: 'bad-type', type: 'podcast', title: 'Bad Type', url: 'https://example.edu/bad' }],
  })
  const view = deriveCourseDetailView(courseWithVideo, Date.parse('2026-12-01T00:00:00Z'))

  assert.equal(result.valid, true)
  assert.equal(invalidType.valid, false)
  assert.match(invalidType.errors.join('\n'), /invalid Material type/)
  assert.deepEqual(view.materialGroups.map((group) => group.type), ['course', 'lab', 'video'])
  assert(view.materialGroups.find((group) => group.type === 'video')?.materials.some((material) => material.title === 'Lecture Recording'))
})

test('Activity is derived from addedAt items, filtered by selected context, and sorted newest first', () => {
  const { courses } = loadTestRepositoryData()
  const activity = deriveActivity(courses, context)

  assert.deepEqual(
    { title: activity[0].title, type: activity[0].type, action: activity[0].action, courseTitle: activity[0].courseTitle },
    { title: 'Retake Exam', type: 'exam', action: 'added', courseTitle: 'Algorithms' },
  )
  assert(activity.some((item) => item.title === 'Cancelled Recurrence Review' && item.type === 'lecture' && item.action === 'cancelled'))
  assert(activity.every((item) => item.courseTitle !== 'Web Engineering'))
})

test('Activity includes Material update events sorted by event timestamp', () => {
  const { courses } = loadTestRepositoryData()
  const coursesWithUpdatedMaterial = courses.map((course) =>
    course.id === 'algorithms'
      ? {
          ...course,
          materials: course.materials.map((material) =>
            material.id === 'alg-course-01'
              ? { ...material, updatedAt: '2026-12-31T12:00:00Z' }
              : material,
          ),
        }
      : course,
  )

  const activity = deriveActivity(coursesWithUpdatedMaterial, context)

  assert.equal(activity[0].title, 'Greedy Algorithms Notes')
  assert.equal(activity[0].type, 'material')
  assert.equal(activity[0].action, 'updated')
  assert.equal(activity[0].occurredAt, '2026-12-31T12:00:00Z')
  assert(activity.some((item) => item.title === 'Retake Exam' && item.type === 'exam'))
  assert(activity.every((item) => item.courseTitle !== 'Web Engineering'))
})

test('Activity omits Material update events when updatedAt equals addedAt', () => {
  const { courses } = loadTestRepositoryData()
  const activity = deriveActivity(courses, context)

  assert(
    activity.some((item) => item.title === 'Greedy Algorithms Notes' && item.type === 'material' && item.action === 'added'),
  )
  assert(
    !activity.some((item) => item.title === 'Greedy Algorithms Notes' && item.type === 'material' && item.action === 'updated'),
  )
})

test('Calendar derives agenda events without a separate dataset', () => {
  const { courses } = loadTestRepositoryData()
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

test('Calendar all-events sorting prioritizes future proximity before past recency', () => {
  const course = {
    id: 'calendar-sorting',
    title: 'Calendar Sorting',
    professors: ['Prof. Time'],
    materials: [],
    assignmentDeadlines: [
      { id: 'past-far', title: 'Past Far', dueAt: '2026-01-01T10:00:00.000Z', addedAt: '2025-12-01T00:00:00.000Z', updatedAt: '2025-12-01T00:00:00.000Z' },
      { id: 'past-near', title: 'Past Near', dueAt: '2026-03-01T10:00:00.000Z', addedAt: '2026-02-01T00:00:00.000Z', updatedAt: '2026-02-01T00:00:00.000Z' },
      { id: 'future-far', title: 'Future Far', dueAt: '2026-06-01T10:00:00.000Z', addedAt: '2026-02-01T00:00:00.000Z', updatedAt: '2026-02-01T00:00:00.000Z' },
      { id: 'future-near', title: 'Future Near', dueAt: '2026-04-01T10:00:00.000Z', addedAt: '2026-02-01T00:00:00.000Z', updatedAt: '2026-02-01T00:00:00.000Z' },
    ],
    courseSessions: [],
    exams: [],
    path: { ...context, courseId: 'calendar-sorting' },
  }

  const events = deriveCalendarEvents({
    courses: [course],
    context,
    eventType: 'all',
    timeRange: 'all',
    now: new Date('2026-03-15T00:00:00.000Z'),
  })

  assert.deepEqual(events.map((event) => event.title), ['Future Near', 'Future Far', 'Past Near', 'Past Far'])
  assert.equal(events.find((event) => event.title === 'Past Near')?.status, 'completed assignment')
})

test('Contribution generation blocks errors and preserves warnings in issue and pull request modes', () => {
  const repository = loadTestRepositoryData()
  const blocked = prepareContribution({
    repository,
    draft: {
      type: 'add-assignment-deadline',
      mode: 'issue',
      path: { ...context, courseId: 'algorithms' },
      payloadText: JSON.stringify({ id: 'broken-assignment', title: 'Broken', materialIds: [], addedAt: '2026-02-01T00:00:00.000Z', updatedAt: '2026-02-01T00:00:00.000Z' }),
    },
  })
  assert.equal(blocked.valid, false)
  assert.match(blocked.errors.join('\n'), /requires dueAt/)

  const issue = prepareContribution({
    repository,
    draft: {
      type: 'add-exam',
      mode: 'issue',
      path: { ...context, courseId: 'algorithms' },
      payloadText: JSON.stringify({ id: 'alg-extra-retake', title: 'Retake Exam', gradeWeight: 5, materialIds: ['alg-exam-01'], addedAt: '2026-02-01T00:00:00.000Z', updatedAt: '2026-02-01T00:00:00.000Z' }),
    },
  })
  assert.equal(issue.valid, true)
  assert.match(issue.issueBody ?? '', /Target Course Path: 2025-2026\/year-2\/semester-1\/algorithms/)
  assert.doesNotMatch(issue.issueBody ?? '', /Validation warnings/)
  assert.doesNotMatch(issue.issueBody ?? '', /date is to be announced/)
  assert.match(issue.issueUrl ?? '', /github.com/)

  const pullRequest = prepareContribution({
    repository,
    draft: {
      type: 'add-material',
      mode: 'pull-request',
      path: { ...context, courseId: 'algorithms' },
      payloadText: JSON.stringify({ id: 'alg-other-01', type: 'other', title: 'Reading List', url: 'https://example.edu/readings', addedAt: '2026-02-01T00:00:00.000Z', updatedAt: '2026-02-01T00:00:00.000Z' }),
    },
  })
  assert.equal(pullRequest.valid, true)
  assert.match(pullRequest.prTitle ?? '', /add-material/)
  assert.match(pullRequest.prBody ?? '', /Reading List/)
  assert.match(pullRequest.githubLink ?? '', /github.com/)
})

test('GitHub issue links stay small while issue bodies retain full review data', () => {
  const repository = loadTestRepositoryData()
  const issue = prepareGeneratedContribution({
    repository,
    now: () => '2026-08-01T10:00:00.000Z',
    draft: {
      type: 'add-material',
      mode: 'issue',
      path: { ...context, courseId: 'algorithms' },
      input: {
        title: 'Dynamic Programming Notes',
        type: 'course',
        url: 'https://example.edu/algorithms/dynamic-programming',
      },
    },
  })

  assert.equal(issue.valid, true)
  assert.match(issue.issueBody ?? '', /Current state/)
  assert.match(issue.issueBody ?? '', /Updated state/)
  assert((issue.issueBody ?? '').length > 8000)
  assert((issue.issueUrl ?? '').length < 1000)
  assert.doesNotMatch(issue.issueUrl ?? '', /body=/)
})

test('Generated Contribution payloads derive ids, timestamps, target paths, and review output', () => {
  const repository = loadTestRepositoryData()
  const generated = prepareGeneratedContribution({
    repository,
    now: () => '2026-08-01T10:00:00.000Z',
    draft: {
      type: 'add-new-course',
      mode: 'pull-request',
      context,
      input: {
        title: 'Machine Learning Basics!',
        professors: ['Dr. Ada Lovelace'],
        description: 'Introductory models and evaluation.',
      },
    },
  })

  assert.equal(generated.valid, true)
  assert.equal(generated.path?.courseId, 'machine-learning-basics')
  assert.equal(generated.updatedCourse?.id, 'machine-learning-basics')
  assert.deepEqual(generated.updatedCourse?.materials, [])
  assert.match(generated.githubLink ?? '', /machine-learning-basics\.json/)

  const material = prepareGeneratedContribution({
    repository,
    now: () => '2026-08-01T10:00:00.000Z',
    draft: {
      type: 'add-material',
      mode: 'issue',
      path: { ...context, courseId: 'algorithms' },
      input: {
        title: 'Greedy Algorithms Notes',
        type: 'course',
        url: 'https://example.edu/algorithms/greedy-v2',
      },
    },
  })

  assert.equal(material.valid, true)
  assert(material.updatedCourse?.materials.some((item) => item.id === 'greedy-algorithms-notes'))
  assert.match(material.changedJson ?? '', /"addedAt": "2026-08-01T10:00:00.000Z"/)
  assert.match(material.changedJson ?? '', /"updatedAt": "2026-08-01T10:00:00.000Z"/)
  assert.match(material.issueBody ?? '', /greedy-algorithms-notes/)

  const collidingMaterial = prepareGeneratedContribution({
    repository,
    now: () => '2026-08-01T10:00:00.000Z',
    draft: {
      type: 'add-material',
      mode: 'issue',
      path: { ...context, courseId: 'algorithms' },
      input: {
        title: 'Algorithms',
        type: 'course',
        url: 'https://example.edu/algorithms/overview',
      },
    },
  })
  assert(collidingMaterial.updatedCourse?.materials.some((item) => item.id === 'algorithms-2'))
})

test('Generated update Material payloads preserve addedAt and replace updatedAt', () => {
  const repository = loadTestRepositoryData()
  const updated = prepareGeneratedContribution({
    repository,
    now: () => '2026-12-31T12:00:00.000Z',
    draft: {
      type: 'update-material',
      mode: 'pull-request',
      path: { ...context, courseId: 'algorithms' },
      input: {
        materialId: 'alg-course-01',
        title: 'Updated Greedy Algorithms Notes',
        type: 'course',
        url: 'https://example.edu/algorithms/greedy-updated',
      },
    },
  })

  const material = updated.updatedCourse?.materials.find((item) => item.id === 'alg-course-01')
  assert.equal(updated.valid, true)
  assert.equal(material?.addedAt, '2026-02-10T08:00:00.000Z')
  assert.equal(material?.updatedAt, '2026-12-31T12:00:00.000Z')
  assert.match(updated.prBody ?? '', /Updated Greedy Algorithms Notes/)
})

test('Generated task Contributions cover assignments, exams, course sessions, and metadata', () => {
  const repository = loadTestRepositoryData()

  const assignment = prepareGeneratedContribution({
    repository,
    now: () => '2026-08-01T10:00:00.000Z',
    draft: {
      type: 'add-assignment-deadline',
      mode: 'issue',
      path: { ...context, courseId: 'algorithms' },
      input: {
        title: 'Shortest Paths Report',
        dueAt: '2026-09-10T20:00:00.000Z',
        materialIds: ['alg-assignment-01'],
        newMaterials: [{ title: 'Shortest Paths Starter', url: 'https://example.edu/algorithms/shortest-paths' }],
      },
    },
  })
  assert.equal(assignment.valid, true)
  assert(assignment.updatedCourse?.assignmentDeadlines.some((item) => item.id === 'shortest-paths-report'))
  assert(assignment.updatedCourse?.materials.some((item) => item.id === 'shortest-paths-starter' && item.type === 'assignment'))

  const exam = prepareGeneratedContribution({
    repository,
    now: () => '2026-08-01T10:00:00.000Z',
    draft: {
      type: 'add-exam',
      mode: 'pull-request',
      path: { ...context, courseId: 'algorithms' },
      input: {
        title: 'Oral Exam',
        materialIds: ['alg-exam-01'],
      },
    },
  })
  assert.equal(exam.valid, true)
  assert.match(exam.warnings.join('\n'), /date is to be announced/)
  assert.doesNotMatch(exam.changedJson ?? '', /"path"/)

  const invalidSession = prepareGeneratedContribution({
    repository,
    draft: {
      type: 'add-course-session',
      mode: 'issue',
      path: { ...context, courseId: 'algorithms' },
      input: { title: 'Backwards', startsAt: '2026-09-10T12:00:00.000Z', endsAt: '2026-09-10T10:00:00.000Z' },
    },
  })
  assert.equal(invalidSession.valid, false)
  assert.match(invalidSession.errors.join('\n'), /ends before it starts/)

  const metadata = prepareGeneratedContribution({
    repository,
    draft: {
      type: 'edit-course-metadata',
      mode: 'pull-request',
      path: { ...context, courseId: 'algorithms' },
      input: { title: 'Advanced Algorithms', professors: ['Dr. Mara Ionescu'] },
    },
  })
  assert.equal(metadata.valid, true)
  assert.equal(metadata.updatedCourse?.title, 'Advanced Algorithms')
  assert.equal(metadata.updatedCourse?.materials.length, repository.courses.find((course) => course.id === 'algorithms')?.materials.length)

  const invalidMaterial = prepareGeneratedContribution({
    repository,
    draft: {
      type: 'add-material',
      mode: 'issue',
      path: { ...context, courseId: 'algorithms' },
      input: { title: 'Bad Material', type: 'podcast', url: './bad.pdf' },
    },
  })
  assert.equal(invalidMaterial.valid, false)
  assert.match(invalidMaterial.errors.join('\n'), /invalid Material type|external URL/)
})

test('Generated Catalog Contributions add academic years, study years, and semesters', () => {
  const repository = loadTestRepositoryData()

  const academicYear = prepareGeneratedContribution({
    repository,
    draft: {
      type: 'add-academic-year',
      mode: 'pull-request',
      input: {
        academicYearId: '2026-2027',
        label: '2026-2027',
      },
    },
  })
  assert.equal(academicYear.valid, true)
  assert.match(academicYear.githubLink ?? '', /public\/data\/catalog\.json/)
  assert.match(academicYear.changedJson ?? '', /2026-2027/)
  assert.deepEqual(academicYear.parsed, { id: '2026-2027', label: '2026-2027', order: 2, studyYears: [] })

  const studyYear = prepareGeneratedContribution({
    repository,
    draft: {
      type: 'add-study-year',
      mode: 'pull-request',
      input: {
        academicYearId: '2025-2026',
        studyYearId: 'year-3',
        label: 'Study Year 3',
      },
    },
  })
  assert.equal(studyYear.valid, true)
  assert.match(studyYear.changedJson ?? '', /"id": "year-3"/)
  assert.deepEqual(studyYear.parsed, { id: 'year-3', label: 'Study Year 3', order: 3, semesters: [] })

  const semester = prepareGeneratedContribution({
    repository,
    draft: {
      type: 'add-semester',
      mode: 'issue',
      input: {
        academicYearId: '2025-2026',
        studyYearId: 'year-1',
        semesterId: 'semester-2',
        label: 'Semester 2',
        courseId: 'analysis',
        courseTitle: 'Analysis',
      },
    },
  })
  assert.equal(semester.valid, true)
  assert.match(semester.issueBody ?? '', /Target Catalog File: public\/data\/catalog\.json/)
  assert.match(semester.changedJson ?? '', /"id": "semester-2"/)
  assert.match(semester.changedJson ?? '', /"id": "analysis"/)
  assert.deepEqual(semester.parsed, {
    id: 'semester-2',
    label: 'Semester 2',
    order: 2,
    courses: [{ id: 'analysis', title: 'Analysis' }],
  })

  const duplicate = prepareGeneratedContribution({
    repository,
    draft: {
      type: 'add-semester',
      mode: 'issue',
      input: {
        academicYearId: '2025-2026',
        studyYearId: 'year-1',
        semesterId: 'semester-1',
        label: 'Semester 1',
      },
    },
  })
  assert.equal(duplicate.valid, false)
  assert.match(duplicate.errors.join('\n'), /already exists/)
})

test('Contribution preparation accepts explicit repository and GitHub adapters', () => {
  const repository = loadTestRepositoryData()
  const result = prepareContribution({
    repository,
    githubTarget: { owner: 'uni', repo: 'hub', branch: 'course-data' },
    draft: {
      type: 'add-material',
      mode: 'pull-request',
      path: { ...context, courseId: 'algorithms' },
      payloadText: JSON.stringify({ id: 'alg-reading-02', type: 'other', title: 'Extra Reading', url: 'https://example.edu/extra', addedAt: '2026-02-01T00:00:00.000Z', updatedAt: '2026-02-01T00:00:00.000Z' }),
    },
  })

  assert.equal(result.valid, true)
  assert.match(result.githubLink ?? '', /github.com\/uni\/hub\/edit\/course-data/)
  assert.match(result.changedJson ?? '', /Extra Reading/)
})

test('update-material Contributions update existing Materials and generate review output', () => {
  const repository = loadTestRepositoryData()
  const target = repository.courses.find((course) => course.id === 'algorithms')
  assert(target)

  const issue = prepareContribution({
    repository,
    draft: {
      type: 'update-material',
      mode: 'issue',
      path: target.path,
      payloadText: JSON.stringify({
        id: 'alg-course-01',
        type: 'video',
        title: 'Updated Greedy Algorithms Recording',
        url: 'https://example.edu/algorithms/greedy-video',
        addedAt: '2026-02-10T08:00:00.000Z',
        updatedAt: '2026-12-31T12:00:00.000Z',
      }),
    },
  })
  const updatedCourse = issue.updatedCourse
  assert.equal(issue.valid, true)
  assert(updatedCourse)
  assert.equal(updatedCourse.materials.length, target.materials.length)
  assert.equal(updatedCourse.materials.find((material) => material.id === 'alg-course-01')?.type, 'video')
  assert.equal(updatedCourse.assignmentDeadlines.length, target.assignmentDeadlines.length)
  assert.match(issue.issueBody ?? '', /update-material/)

  const pullRequest = prepareContribution({
    repository,
    draft: {
      type: 'update-material',
      mode: 'pull-request',
      path: target.path,
      payloadText: JSON.stringify({
        id: 'alg-course-01',
        title: 'Updated Greedy Algorithms Notes',
        type: 'course',
        url: 'https://example.edu/algorithms/greedy-updated',
        addedAt: '2026-02-10T08:00:00.000Z',
        updatedAt: '2026-12-31T12:00:00.000Z',
      }),
    },
  })
  assert.equal(pullRequest.valid, true)
  assert.match(pullRequest.githubLink ?? '', /public\/data\/courses/)
  assert.match(pullRequest.prBody ?? '', /Updated Greedy Algorithms Notes/)
})

test('update-material Contributions reject missing targets and invalid Material types', () => {
  const repository = loadTestRepositoryData()
  const target = repository.courses.find((course) => course.id === 'algorithms')
  assert(target)

  const missing = prepareContribution({
    repository,
    draft: {
      type: 'update-material',
      mode: 'issue',
      path: target.path,
    payloadText: JSON.stringify({ id: 'missing-material', title: 'Missing', type: 'course', url: 'https://example.edu/missing', addedAt: '2026-02-01T00:00:00.000Z', updatedAt: '2026-02-01T00:00:00.000Z' }),
    },
  })
  assert.equal(missing.valid, false)
  assert.match(missing.errors.join('\n'), /does not exist/)

  const invalidType = prepareContribution({
    repository,
    draft: {
      type: 'update-material',
      mode: 'issue',
      path: target.path,
    payloadText: JSON.stringify({ id: 'alg-course-01', title: 'Bad', type: 'podcast', url: 'https://example.edu/bad', addedAt: '2026-02-10T08:00:00.000Z', updatedAt: '2026-02-01T00:00:00.000Z' }),
    },
  })
  assert.equal(invalidType.valid, false)
  assert.match(invalidType.errors.join('\n'), /invalid Material type/)
})

test('Material Suggestions produce student-facing GitHub issue output with maintainer Contribution details', () => {
  const repository = loadTestRepositoryData()
  const course = repository.courses.find((item) => item.id === 'algorithms')
  assert(course)

  const suggestion = prepareSuggestion({
    repository,
    course,
    section: 'materials',
    intent: 'add-material',
    input: {
      title: 'Dynamic Programming Notes',
      type: 'course',
      url: 'https://example.edu/algorithms/dynamic-programming',
    },
    now: () => '2026-08-01T10:00:00.000Z',
  })

  assert.equal(suggestion.valid, true)
  assert.equal(suggestion.issueTitle ?? '', 'Suggestion: Add material to Algorithms')
  assert.match(suggestion.summary ?? '', /Add material "Dynamic Programming Notes" to Algorithms/)
  assert.doesNotMatch(suggestion.summary ?? '', /add-material|Contribution type|Target Course Path/)
  assert.match(suggestion.issueBody ?? '', /^Suggestion summary/m)
  assert.match(suggestion.issueBody ?? '', /Generated Contribution details for maintainers/)
  assert.match(suggestion.issueBody ?? '', /Contribution type: add-material/)
  assert.match(suggestion.issueBody ?? '', /Current state/)
  assert.match(suggestion.issueBody ?? '', /Diff/)
  assert.doesNotMatch(suggestion.issueBody ?? '', /UniHub uses GitHub for maintainer review/)
  assert.match(suggestion.issueUrl ?? '', /github\.com\/David-I7\/unihub\/issues\/new/)
  assert((suggestion.issueUrl ?? '').length < 1000)
  assert.doesNotMatch(suggestion.issueUrl ?? '', /body=/)
  assert.match(decodeURIComponent(suggestion.issueUrl ?? ''), /Suggestion: Add material to Algorithms/)
})

test('Suggestion options omit Contribution-level update duplicates', () => {
  assert.deepEqual(suggestionIntentsForSection('materials').map((item) => item.value), [
    'add-material',
    'fix-material',
    'broken-material-link',
  ])
  assert.deepEqual(suggestionIntentsForSection('assignments').map((item) => item.value), [
    'add-assignment',
    'fix-assignment',
    'changed-assignment-deadline',
  ])
  assert.deepEqual(suggestionIntentsForSection('lectures').map((item) => item.value), [
    'add-lecture',
    'fix-lecture',
    'cancel-lecture',
    'changed-lecture-time-location',
  ])
  assert.deepEqual(suggestionIntentsForSection('exams').map((item) => item.value), [
    'add-exam',
    'fix-exam',
    'changed-exam-date-location',
    'exam-date-not-announced',
  ])
})

test('Suggestions require notes for corrections and support Course page sections', () => {
  const repository = loadTestRepositoryData()
  const course = repository.courses.find((item) => item.id === 'algorithms')
  assert(course)

  const missingNote = prepareSuggestion({
    repository,
    course,
    section: 'materials',
    intent: 'broken-material-link',
    input: {
      materialId: 'alg-course-01',
      title: 'Greedy Algorithms Notes',
      url: 'https://example.edu/algorithms/greedy-fixed',
    },
  })
  assert.equal(missingNote.valid, false)
  assert.match(missingNote.errors.join('\n'), /require a note or source/)

  const suggestions = [
    prepareSuggestion({
      repository,
      course,
      section: 'assignments',
      intent: 'add-assignment',
      input: { title: 'Dynamic Programming Report', dueAt: '2026-09-10T20:00:00.000Z' },
    }),
    prepareSuggestion({
      repository,
      course,
      section: 'lectures',
      intent: 'cancel-lecture',
      input: {
        title: 'Greedy Algorithms Seminar',
        startsAt: '2026-09-12T08:00:00.000Z',
        endsAt: '2026-09-12T10:00:00.000Z',
        note: 'Professor announcement on Moodle.',
      },
    }),
    prepareSuggestion({
      repository,
      course,
      section: 'exams',
      intent: 'exam-date-not-announced',
      input: { title: 'Final Exam', note: 'The professor removed the date from the syllabus.' },
    }),
    prepareSuggestion({
      repository,
      course,
      section: 'course-info',
      intent: 'fix-course-professors',
      input: { professorsText: 'Dr. Mara Ionescu, Dr. Ion Popescu', note: 'Updated department course page.' },
    }),
  ]

  assert.deepEqual(suggestions.map((suggestion) => suggestion.valid), [true, true, true, true])
  for (const suggestion of suggestions) {
    assert.doesNotMatch(suggestion.summary ?? '', /add-assignment-deadline|add-course-session|add-exam|edit-course-metadata/)
    assert.match(suggestion.issueBody ?? '', /Generated Contribution details for maintainers/)
    assert.match(suggestion.issueUrl ?? '', /github\.com\/David-I7\/unihub\/issues\/new/)
  }
})

test('repositorySchema exposes zod runtime schemas for Catalog and Course data', () => {
  assert.equal(repositorySchema.catalog.safeParse({ academicYears: [] }).success, true)
  assert.equal(
    repositorySchema.course.safeParse({
      id: 'algorithms',
      title: 'Algorithms',
      professors: ['Dr. Mara Ionescu'],
      materials: [],
      assignmentDeadlines: [],
      courseSessions: [],
      exams: [],
    }).success,
    true,
  )
  assert.equal(repositorySchema.course.safeParse({ id: 'broken' }).success, false)
})

test('applyContribution supports flexible array of objects (batch) for batchable types and rejects it for non-batchable types', () => {
  const repository = loadTestRepositoryData()
  const target = repository.courses.find((c) => c.id === 'algorithms')
  assert(target)

  // 1. Valid batch contribution of materials
  const batchMaterials = [
    { id: 'batch-mat-1', type: 'course', title: 'Batch Material 1', url: 'https://example.edu/1', addedAt: '2026-02-01T00:00:00.000Z', updatedAt: '2026-02-01T00:00:00.000Z' },
    { id: 'batch-mat-2', type: 'course', title: 'Batch Material 2', url: 'https://example.edu/2', addedAt: '2026-02-01T00:00:00.000Z', updatedAt: '2026-02-01T00:00:00.000Z' },
  ]
  const resultOk = prepareContribution({
    repository,
    draft: {
      type: 'add-material',
      mode: 'issue',
      path: target.path,
      payloadText: JSON.stringify(batchMaterials),
    },
  })
  assert.equal(resultOk.valid, true)
  assert.match(resultOk.changedJson ?? '', /Batch Material 1/)
  assert.match(resultOk.changedJson ?? '', /Batch Material 2/)

  // Verify that pre-existing course warning "Grade Weight total is below 100 and incomplete" is ignored
  const hasCourseLevelWarning = resultOk.warnings.some((w) => w.includes('below 100'))
  assert.equal(hasCourseLevelWarning, false)

  // 2. Reject arrays for non-batchable types
  const badBatchMetadata = [
    { title: 'New Course Title 1' },
    { title: 'New Course Title 2' },
  ]
  const resultErr = prepareContribution({
    repository,
    draft: {
      type: 'edit-course-metadata',
      mode: 'issue',
      path: target.path,
      payloadText: JSON.stringify(badBatchMetadata),
    },
  })
  assert.equal(resultErr.valid, false)
  assert.match(resultErr.errors.join('\n'), /does not support multiple items/)

  // 3. Error when duplicate ID exists in the course
  const dupIdPayload = { id: 'alg-course-01', type: 'course', title: 'Duplicate ID Material', url: 'https://example.edu', addedAt: '2026-02-01T00:00:00.000Z', updatedAt: '2026-02-01T00:00:00.000Z' }
  const resultDupId = prepareContribution({
    repository,
    draft: {
      type: 'add-material',
      mode: 'issue',
      path: target.path,
      payloadText: JSON.stringify(dupIdPayload),
    },
  })
  assert.equal(resultDupId.valid, false)
  assert.match(resultDupId.errors.join('\n'), /Duplicate ID/)

  // 4. Contributions may add gradeWeight totals above 100 (existing algorithms weight is 90)
  const heavyExam = { id: 'heavy-exam', title: 'Heavy Exam', gradeWeight: 15, addedAt: '2026-02-01T00:00:00.000Z', updatedAt: '2026-02-01T00:00:00.000Z' } // 90 + 15 = 105
  const resultHeavy = prepareContribution({
    repository,
    draft: {
      type: 'add-exam',
      mode: 'issue',
      path: target.path,
      payloadText: JSON.stringify(heavyExam),
    },
  })
  assert.equal(resultHeavy.valid, true)
  assert.doesNotMatch(resultHeavy.errors.join('\n'), /Grade Weight total cannot exceed 100/)
})

test('validation formatting produces non-cryptic error messages for UI display', () => {
  const repository = loadTestRepositoryData()
  const target = repository.courses[0]

  // 1. Single contribution validation error formatting (no Item X index)
  const singleResult = prepareContribution({
    repository,
    draft: {
      type: 'add-assignment-deadline',
      mode: 'issue',
      path: target.path,
      payloadText: JSON.stringify({
        id: 'new-deadline',
        title: '', // Empty title
        dueAt: '', // Empty dueAt
        addedAt: '2026-02-01T00:00:00.000Z',
        updatedAt: '2026-02-01T00:00:00.000Z',
      }),
    },
  })
  assert.equal(singleResult.valid, false)
  // Should omit "Item X" and "Contribution" prefix, returning clean messages:
  assert.deepEqual(singleResult.errors, [
    'Assignment Deadline requires title.',
    'Assignment Deadline requires dueAt.',
  ])

  // 2. Full Course validation error formatting (includes Item X index)
  const badCourse = validateCourse({
    id: 'course-error',
    title: 'Error Course',
    professors: [],
    materials: [],
    assignmentDeadlines: [
      { id: 'dl-1', title: 'Valid Deadline', dueAt: '2026-02-15T00:00:00Z', addedAt: '2026-02-01T00:00:00.000Z', updatedAt: '2026-02-01T00:00:00.000Z' },
      { id: 'dl-2', title: '', dueAt: '', addedAt: '2026-02-01T00:00:00.000Z', updatedAt: '2026-02-01T00:00:00.000Z' }, // Invalid title and dueAt
    ],
    courseSessions: [],
    exams: [],
  })
  assert.equal(badCourse.valid, false)
  // Should preserve Item index for course validation:
  assert.ok(badCourse.errors.includes('Item 2 Assignment Deadline requires title.'))
  assert.ok(badCourse.errors.includes('Item 2 Assignment Deadline requires dueAt.'))
})
