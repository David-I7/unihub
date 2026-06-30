import { createRequire } from 'module'
declare global {
  var nodeRequire: ((id: string) => unknown) | undefined
}
globalThis.nodeRequire = createRequire(import.meta.url)

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
} from '../src/domain/index.js'

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
  assert.doesNotMatch(badCourse.errors.join('\n'), /Grade Weight total cannot exceed 100/)
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

test('validation accepts Grade Weight totals above 100 while warning below 100 totals', () => {
  const overweight = validateCourse({
    id: 'overweight',
    title: 'Overweight Course',
    professors: ['Prof. Ada'],
    materials: [],
    assignmentDeadlines: [{ id: 'assignment', title: 'Assignment', dueAt: '2026-03-15T21:59:00.000Z', gradeWeight: 80 }],
    courseSessions: [],
    exams: [{ id: 'exam', title: 'Exam', startsAt: '2026-04-20T09:00:00.000Z', gradeWeight: 40 }],
  })
  const incomplete = validateCourse({
    id: 'incomplete-weights',
    title: 'Incomplete Weights',
    professors: ['Prof. Ada'],
    materials: [],
    assignmentDeadlines: [{ id: 'assignment', title: 'Assignment', dueAt: '2026-03-15T21:59:00.000Z', gradeWeight: 40 }],
    courseSessions: [],
    exams: [],
  })

  assert.equal(overweight.valid, true)
  assert.doesNotMatch(overweight.errors.join('\n'), /Grade Weight total cannot exceed 100/)
  assert.equal(incomplete.valid, true)
  assert.match(incomplete.warnings.join('\n'), /below 100/)
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
  const path = coursePathFromRepositoryPath('./public/data/courses/2025-2026/year-2/semester-1/algorithms.json')

  assert.deepEqual(path, { ...context, courseId: 'algorithms' })
  assert.equal(courseRoute(path), '#/courses/2025-2026/year-2/semester-1/algorithms')
  assert.equal(courseDataFilePath(path), 'public/data/courses/2025-2026/year-2/semester-1/algorithms.json')
})

test('Course detail view concentrates tab display derivation', () => {
  const { courses } = loadRepositoryData()
  const course = courses.find((item) => item.id === 'algorithms')
  assert(course)

  const view = deriveCourseDetailView(course, Date.parse('2026-12-01T00:00:00Z'))

  assert.deepEqual(view.materialGroups.map((group) => group.type), ['course', 'seminar', 'lab', 'video', 'other'])
  assert(view.assignments.every((assignment) => assignment.status === 'completed'))
  assert(view.courseSessions.some((session) => session.status === 'cancelled'))
  assert(view.exams.some((exam) => exam.materials.every((material) => material.type === 'exam')))
  assert.equal(view.gradeBreakdown.total > 0, true)
})

test('video Materials validate and appear with general Course detail Materials', () => {
  const { courses } = loadRepositoryData()
  const course = courses.find((item) => item.id === 'algorithms')
  assert(course)
  const courseWithVideo = {
    ...course,
    materials: [
      ...course.materials,
      { id: 'alg-video-01', type: 'video' as const, title: 'Lecture Recording', url: 'https://example.edu/recording', addedAt: '2026-10-20T10:00:00Z' },
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
  assert.deepEqual(view.materialGroups.map((group) => group.type), ['course', 'seminar', 'lab', 'video', 'other'])
  assert(view.materialGroups.find((group) => group.type === 'video')?.materials.some((material) => material.title === 'Lecture Recording'))
})

test('Activity is derived from addedAt items, filtered by selected context, and sorted newest first', () => {
  const { courses } = loadRepositoryData()
  const activity = deriveActivity(courses, context)

  assert.equal(activity[0].text, 'Retake Exam Exam added for Algorithms')
  assert(activity.some((item) => item.text === 'Cancelled Recurrence Review Lecture added for Algorithms (cancelled)'))
  assert(activity.every((item) => !item.text.includes('Web Engineering')))
})

test('Activity includes Material update events sorted by event timestamp', () => {
  const { courses } = loadRepositoryData()
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

  assert.equal(activity[0].text, 'Greedy Algorithms Notes Material updated for Algorithms')
  assert.equal(activity[0].occurredAt, '2026-12-31T12:00:00Z')
  assert(activity.some((item) => item.text === 'Retake Exam Exam added for Algorithms'))
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

test('update-material Contributions update existing Materials and generate review output', () => {
  const repository = loadRepositoryData()
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
        updatedAt: '2026-12-31T12:00:00.000Z',
      }),
    },
  })
  assert.equal(pullRequest.valid, true)
  assert.match(pullRequest.githubLink ?? '', /public\/data\/courses/)
  assert.match(pullRequest.prBody ?? '', /Updated Greedy Algorithms Notes/)
})

test('update-material Contributions reject missing targets and invalid Material types', () => {
  const repository = loadRepositoryData()
  const target = repository.courses.find((course) => course.id === 'algorithms')
  assert(target)

  const missing = prepareContribution({
    repository,
    draft: {
      type: 'update-material',
      mode: 'issue',
      path: target.path,
      payloadText: JSON.stringify({ id: 'missing-material', title: 'Missing', type: 'course', url: 'https://example.edu/missing' }),
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
      payloadText: JSON.stringify({ id: 'alg-course-01', title: 'Bad', type: 'podcast', url: 'https://example.edu/bad' }),
    },
  })
  assert.equal(invalidType.valid, false)
  assert.match(invalidType.errors.join('\n'), /invalid Material type/)
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
  const repository = loadRepositoryData()
  const target = repository.courses.find((c) => c.id === 'algorithms')
  assert(target)

  // 1. Valid batch contribution of materials
  const batchMaterials = [
    { id: 'batch-mat-1', type: 'course', title: 'Batch Material 1', url: 'https://example.edu/1' },
    { id: 'batch-mat-2', type: 'course', title: 'Batch Material 2', url: 'https://example.edu/2' },
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
  const dupIdPayload = { id: 'alg-course-01', type: 'course', title: 'Duplicate ID Material', url: 'https://example.edu' }
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
  const heavyExam = { id: 'heavy-exam', title: 'Heavy Exam', gradeWeight: 15 } // 90 + 15 = 105
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
