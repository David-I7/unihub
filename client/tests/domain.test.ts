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

test('Course validation requires controlled Material and Passing Difficulty values', () => {
  const valid = validateCourse({
    id: 'difficulty-contract',
    title: 'Difficulty Contract',
    professors: ['Prof. Ada'],
    description: 'A course with explicit unknown difficulty.',
    materialDifficulty: 'unknown',
    passingDifficulty: 'unknown',
    materials: [],
    assignmentDeadlines: [],
    courseSessions: [],
    exams: [],
  })
  const missing = validateCourse({
    id: 'missing-difficulty',
    title: 'Missing Difficulty',
    professors: ['Prof. Ada'],
    materials: [],
    assignmentDeadlines: [],
    courseSessions: [],
    exams: [],
  })
  const invalid = validateCourse({
    id: 'invalid-difficulty',
    title: 'Invalid Difficulty',
    professors: ['Prof. Ada'],
    materialDifficulty: 'brutal',
    passingDifficulty: 'easy',
    materials: [],
    assignmentDeadlines: [],
    courseSessions: [],
    exams: [],
  })

  assert.equal(valid.valid, true)
  assert.equal(missing.valid, false)
  assert.match(missing.errors.join('\n'), /Material Difficulty/)
  assert.match(missing.errors.join('\n'), /Passing Difficulty/)
  assert.equal(invalid.valid, false)
  assert.match(invalid.errors.join('\n'), /Material Difficulty/)
})

test('validation allows incomplete valid data with warnings', () => {
  const result = validateCourse({
    id: 'incomplete',
    title: 'Incomplete Course',
    professors: ['Prof. Ada'],
    materialDifficulty: 'unknown',
    passingDifficulty: 'unknown',
    materials: [],
    assignmentDeadlines: [],
    courseSessions: [],
    exams: [{ id: 'exam-tba', title: 'Exam To Be Announced', gradeWeight: 40, materialIds: [], addedAt: '2026-02-01T00:00:00.000Z', updatedAt: '2026-02-01T00:00:00.000Z' }],
  })

  assert.equal(result.valid, true)
  assert.match(result.warnings.join('\n'), /no Materials/)
  assert.match(result.warnings.join('\n'), /date is to be announced/)
  assert.match(result.warnings.join('\n'), /below 100/)
})

test('validation accepts Grade Weight totals above 100 while warning below 100 totals', () => {
  const overweight = validateCourse({
    id: 'overweight',
    title: 'Overweight Course',
    professors: ['Prof. Ada'],
    materialDifficulty: 'unknown',
    passingDifficulty: 'unknown',
    materials: [],
    assignmentDeadlines: [{ id: 'assignment', title: 'Assignment', dueAt: '2026-03-15T21:59:00.000Z', gradeWeight: 80, addedAt: '2026-02-01T00:00:00.000Z', updatedAt: '2026-02-01T00:00:00.000Z' }],
    courseSessions: [],
    exams: [{ id: 'exam', title: 'Exam', startsAt: '2026-04-20T09:00:00.000Z', gradeWeight: 40, addedAt: '2026-02-01T00:00:00.000Z', updatedAt: '2026-02-01T00:00:00.000Z' }],
  })
  const incomplete = validateCourse({
    id: 'incomplete-weights',
    title: 'Incomplete Weights',
    professors: ['Prof. Ada'],
    materialDifficulty: 'unknown',
    passingDifficulty: 'unknown',
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

test('Course detail view derives About content without duplicating item notes', () => {
  const course = {
    id: 'about-course',
    title: 'About Course',
    professors: ['Prof. Ada'],
    description: 'Course-level description.',
    materialDifficulty: 'medium' as const,
    passingDifficulty: 'hard' as const,
    materials: [],
    assignmentDeadlines: [
      { id: 'assignment-with-weight', title: 'Project', description: 'Project instructions.', dueAt: '2026-03-15T21:59:00.000Z', gradeWeight: 35, addedAt: '2026-02-01T00:00:00.000Z', updatedAt: '2026-02-01T00:00:00.000Z' },
      { id: 'assignment-without-weight', title: 'Practice', description: 'Practice notes.', dueAt: '2026-03-20T21:59:00.000Z', addedAt: '2026-02-01T00:00:00.000Z', updatedAt: '2026-02-01T00:00:00.000Z' },
    ],
    courseSessions: [],
    exams: [
      { id: 'final', title: 'Final Exam', description: 'Bring ID.', location: 'Room 10', gradeWeight: 65, addedAt: '2026-02-01T00:00:00.000Z', updatedAt: '2026-02-01T00:00:00.000Z' },
    ],
    path: { ...context, courseId: 'about-course' },
  }

  const view = deriveCourseDetailView(course, Date.parse('2026-02-01T00:00:00Z'))

  assert.deepEqual(view.about, {
    description: 'Course-level description.',
    materialDifficulty: 'medium',
    passingDifficulty: 'hard',
  })
  assert.deepEqual(view.gradeBreakdown.items, [
    { title: 'Project', weight: 35, type: 'assignment' },
    { title: 'Final Exam', weight: 65, type: 'exam' },
  ])
  assert.doesNotMatch(JSON.stringify(view.about), /Project instructions|Bring ID/)
  assert.equal(view.exams[0].description, 'Bring ID.')
  assert.equal(view.exams[0].location, 'Room 10')
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
    materialDifficulty: 'unknown' as const,
    passingDifficulty: 'unknown' as const,
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

test('Contribution generation blocks errors and preserves warnings in issue mode', () => {
  const repository = loadTestRepositoryData()
  const blocked = prepareContribution({
    repository,
    draft: {
      type: 'add-assignment-deadline',
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
      path: { ...context, courseId: 'algorithms' },
      payloadText: JSON.stringify({ id: 'alg-extra-retake', title: 'Retake Exam', gradeWeight: 5, materialIds: ['alg-exam-01'], addedAt: '2026-02-01T00:00:00.000Z', updatedAt: '2026-02-01T00:00:00.000Z' }),
    },
  })

  assert.equal(issue.valid, true)
  assert.match(issue.issueBody ?? '', /Target Course Path/)
  assert.match(issue.issueUrl ?? '', /github.com/)
})

test('GitHub issue links stay small while issue bodies retain full review data', () => {
  const repository = loadTestRepositoryData()
  const issue = prepareGeneratedContribution({
    repository,
    now: () => '2026-08-01T10:00:00.000Z',
    draft: {
      type: 'add-material',
      path: { ...context, courseId: 'algorithms' },
      input: {
        title: 'Dynamic Programming Notes',
        type: 'course',
        url: 'https://example.edu/algorithms/dynamic-programming',
      },
    },
  })

  assert.equal(issue.valid, true)
  assert.match(issue.issueBody ?? '', /Diff/)
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
  assert.equal(generated.updatedCourse?.materialDifficulty, 'unknown')
  assert.equal(generated.updatedCourse?.passingDifficulty, 'unknown')
  assert.deepEqual(generated.updatedCourse?.materials, [])
  assert.match(generated.issueUrl ?? '', /github.com/)

  const material = prepareGeneratedContribution({
    repository,
    now: () => '2026-08-01T10:00:00.000Z',
    draft: {
      type: 'add-material',
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
})

test('Generated new Course Contributions include Course state and Catalog change', () => {
  const repository = loadTestRepositoryData()
  const generated = prepareGeneratedContribution({
    repository,
    now: () => '2026-08-01T10:00:00.000Z',
    draft: {
      type: 'add-new-course',
      context,
      input: {
        title: 'Compiler Design',
        professors: ['Dr. Grace Hopper'],
        materialDifficulty: 'hard',
        passingDifficulty: 'medium',
      },
    },
  })

  assert.equal(generated.valid, true)
  assert.equal(generated.updatedCourse?.id, 'compiler-design')
  assert.equal(generated.updatedCourse?.materialDifficulty, 'hard')
  assert.equal(generated.updatedCourse?.passingDifficulty, 'medium')
  assert(generated.updatedCatalog?.academicYears.some((year) => year.id === '2025-2026'))
  assert(generated.updatedCatalog?.academicYears
    .find((year) => year.id === '2025-2026')?.studyYears
    .find((year) => year.id === 'year-2')?.semesters
    .find((semester) => semester.id === 'semester-1')?.courses
    ?.some((course) => course.id === 'compiler-design'))
  assert.match(generated.issueBody ?? '', /Course file diff/)
  assert.match(generated.issueBody ?? '', /Catalog diff/)
  assert.match(generated.issueBody ?? '', /compiler-design/)
})

test('Generated update Material payloads preserve addedAt and replace updatedAt', () => {
  const repository = loadTestRepositoryData()
  const updated = prepareGeneratedContribution({
    repository,
    now: () => '2026-12-31T12:00:00.000Z',
    draft: {
      type: 'update-material',
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
  assert.match(updated.issueBody ?? '', /Updated Greedy Algorithms Notes/)
})

test('Generated task Contributions cover assignments, exams, course sessions, and metadata', () => {
  const repository = loadTestRepositoryData()
  const assignment = prepareGeneratedContribution({
    repository,
    now: () => '2026-08-01T10:00:00.000Z',
    draft: {
      type: 'add-assignment-deadline',
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
  assert.equal('submissionUrl' in (assignment.updatedCourse?.assignmentDeadlines.find((item) => item.id === 'shortest-paths-report') ?? {}), false)
  assert(assignment.updatedCourse?.materials.some((item) => item.id === 'shortest-paths-starter' && item.type === 'assignment'))

  const exam = prepareGeneratedContribution({
    repository,
    now: () => '2026-08-01T10:00:00.000Z',
    draft: {
      type: 'add-exam',
      path: { ...context, courseId: 'algorithms' },
      input: {
        title: 'Oral Exam',
        description: 'Oral exam topics.',
        location: 'Room 12',
        gradeWeight: 10,
        materialIds: ['alg-exam-01'],
      },
    },
  })
  assert.equal(exam.valid, true)
  assert.equal(exam.updatedCourse?.exams.find((item) => item.id === 'oral-exam')?.description, 'Oral exam topics.')
  assert.equal(exam.updatedCourse?.exams.find((item) => item.id === 'oral-exam')?.location, 'Room 12')

  const invalidSession = prepareGeneratedContribution({
    repository,
    draft: {
      type: 'add-course-session',
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
      path: { ...context, courseId: 'algorithms' },
      input: { title: 'Advanced Algorithms', professors: ['Dr. Mara Ionescu'], materialDifficulty: 'hard', passingDifficulty: 'medium' },
    },
  })
  assert.equal(metadata.valid, true)
  assert.equal(metadata.updatedCourse?.title, 'Advanced Algorithms')
  assert.deepEqual(metadata.updatedCourse?.professors, ['Dr. Mara Ionescu'])
})

test('Generated Catalog Contributions add academic years, study years, and semesters', () => {
  const repository = loadTestRepositoryData()

  const academicYear = prepareGeneratedContribution({
    repository,
    draft: {
      type: 'add-academic-year',
      input: {
        academicYearId: '2026-2027',
        label: '2026-2027',
      },
    },
  })
  assert.equal(academicYear.valid, true)
  assert.match(academicYear.issueBody ?? '', /public\/data\/catalog\.json/)
  assert.match(academicYear.changedJson ?? '', /2026-2027/)
  assert.deepEqual(academicYear.parsed, { id: '2026-2027', label: '2026-2027', order: 2, studyYears: [] })

  const studyYear = prepareGeneratedContribution({
    repository,
    draft: {
      type: 'add-study-year',
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
})

test('Catalog Contributions require hierarchy targets and derive ids from labels', () => {
  const repository = loadTestRepositoryData()

  const missingStudyYearTarget = prepareGeneratedContribution({
    repository,
    draft: {
      type: 'add-study-year',
      input: { label: 'Study Year 4' },
    },
  })
  const derivedStudyYear = prepareGeneratedContribution({
    repository,
    draft: {
      type: 'add-study-year',
      input: { academicYearId: '2025-2026', label: 'Study Year 4' },
    },
  })
  const missingSemesterTarget = prepareGeneratedContribution({
    repository,
    draft: {
      type: 'add-semester',
      input: { academicYearId: '2025-2026', label: 'Semester 3' },
    },
  })

  assert.equal(missingStudyYearTarget.valid, false)
  assert.match(missingStudyYearTarget.errors.join('\n'), /Academic Year id is required/)
  assert.equal(derivedStudyYear.valid, true)
  assert.deepEqual(derivedStudyYear.parsed, { id: 'study-year-4', label: 'Study Year 4', order: 3, semesters: [] })
  assert.equal(missingSemesterTarget.valid, false)
  assert.match(missingSemesterTarget.errors.join('\n'), /Study Year/)
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
  assert.match(suggestion.issueBody ?? '', /^Suggestion summary/m)
  assert.match(suggestion.issueBody ?? '', /Generated Contribution details for maintainers/)
  assert.match(suggestion.issueUrl ?? '', /github\.com\/David-I7\/unihub\/issues\/new/)
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
})

test('Issue 01: Issue-only contribution contract returns issueBody and issueUrl without PR properties', () => {
  const repository = loadTestRepositoryData()
  const prepared = prepareContribution({
    repository,
    draft: {
      type: 'add-material',
      path: { ...context, courseId: 'algorithms' },
      payloadText: JSON.stringify({ id: 'alg-other-01', type: 'other', title: 'Reading List', url: 'https://example.edu/readings', addedAt: '2026-02-01T00:00:00.000Z', updatedAt: '2026-02-01T00:00:00.000Z' }),
    },
  })
  assert.equal(prepared.valid, true)
  assert.match(prepared.issueBody ?? '', /add-material/)
  assert.match(prepared.issueBody ?? '', /Reading List/)
  assert.equal('prTitle' in prepared, false)
  assert.equal('prBody' in prepared, false)
  assert.equal('githubLink' in prepared, false)
})

test('Issue 02: New Course requires at least one professor in validation and contribution payload', () => {
  const badCourse = validateCourse({
    id: 'no-profs',
    title: 'No Profs Course',
    professors: [],
    materialDifficulty: 'unknown',
    passingDifficulty: 'unknown',
    materials: [],
    assignmentDeadlines: [],
    courseSessions: [],
    exams: [],
  })
  assert.equal(badCourse.valid, false)
  assert.match(badCourse.errors.join('\n'), /at least one professor/)

  const repository = loadTestRepositoryData()
  const generatedEmptyProf = prepareGeneratedContribution({
    repository,
    draft: {
      type: 'add-new-course',
      context,
      input: { title: 'Professors Test', professors: '' },
    },
  })
  assert.equal(generatedEmptyProf.valid, false)
  assert.match(generatedEmptyProf.errors.join('\n'), /at least one professor/)

  const generatedParsedProfs = prepareGeneratedContribution({
    repository,
    draft: {
      type: 'add-new-course',
      context,
      input: { title: 'Professors Split', professors: 'Dr. Alan Turing, Prof. Ada Lovelace' },
    },
  })
  assert.equal(generatedParsedProfs.valid, true)
  assert.deepEqual(generatedParsedProfs.updatedCourse?.professors, ['Dr. Alan Turing', 'Prof. Ada Lovelace'])
})

test('Issue 03: Composite Add Semester flow supports creating new Academic Year and Study Year inline', () => {
  const repository = loadTestRepositoryData()
  const compositeResult = prepareGeneratedContribution({
    repository,
    draft: {
      type: 'add-semester',
      input: {
        academicYearLabel: '2027-2028',
        studyYearLabel: 'Study Year 1',
        semesterLabel: 'Semester 1',
      },
    },
  })

  assert.equal(compositeResult.valid, true)
  const updatedCatalog = compositeResult.updatedCatalog
  assert(updatedCatalog)
  const newYear = updatedCatalog.academicYears.find((y) => y.id === '2027-2028')
  assert(newYear)
  assert.equal(newYear.studyYears[0].id, 'study-year-1')
  assert.equal(newYear.studyYears[0].semesters[0].id, 'semester-1')
})

test('Issue 04: Compatible material linking and hidden inline material toggle', () => {
  const repository = loadTestRepositoryData()
  const target = repository.courses.find((c) => c.id === 'algorithms')
  assert(target)

  // Invalid material linking (referencing a non-assignment material)
  const invalidAssignmentLink = validateCourse({
    ...target,
    assignmentDeadlines: [
      {
        id: 'bad-link-dl',
        title: 'Bad Link',
        dueAt: '2026-05-01T00:00:00Z',
        materialIds: ['alg-exam-01'], // Exam material!
        addedAt: '2026-02-01T00:00:00.000Z',
        updatedAt: '2026-02-01T00:00:00.000Z',
      },
    ],
  })
  assert.equal(invalidAssignmentLink.valid, false)
  assert.match(invalidAssignmentLink.errors.join('\n'), /non-assignment Material/)

  // Hidden inline material toggle: should not generate inline material payload when toggle is false
  const noInline = prepareGeneratedContribution({
    repository,
    draft: {
      type: 'add-assignment-deadline',
      path: target.path,
      input: {
        title: 'Standalone Homework',
        dueAt: '2026-06-01T00:00:00.000Z',
        createInlineMaterial: false,
        newMaterials: [{ title: 'Unused Material', url: 'https://example.edu/unused' }],
      },
    },
  })
  assert.equal(noInline.valid, true)
  assert.equal(noInline.updatedCourse?.materials.some((m) => m.title === 'Unused Material'), false)
})

test('Issue 05: Maintainer batch contribution items and duplicate ID guards', () => {
  const repository = loadTestRepositoryData()
  const target = repository.courses.find((c) => c.id === 'algorithms')
  assert(target)

  // Batch exams contribution generating 1 single GitHub issue output
  const batchExams = prepareGeneratedContribution({
    repository,
    draft: {
      type: 'add-exam',
      path: target.path,
      input: {
        items: [
          { title: 'Midterm Exam 1', gradeWeight: 20 },
          { title: 'Midterm Exam 2', gradeWeight: 20 },
        ],
      },
    },
  })
  assert.equal(batchExams.valid, true)
  assert.match(batchExams.issueBody ?? '', /midterm-exam-1/)
  assert.match(batchExams.issueBody ?? '', /midterm-exam-2/)

  // Batch duplicate ID guardrail
  const duplicateBatch = prepareGeneratedContribution({
    repository,
    draft: {
      type: 'add-exam',
      path: target.path,
      input: {
        items: [
          { id: 'dup-id', title: 'Duplicate Midterm 1', gradeWeight: 20 },
          { id: 'dup-id', title: 'Duplicate Midterm 2', gradeWeight: 20 },
        ],
      },
    },
  })
  assert.equal(duplicateBatch.valid, false)
  assert.match(duplicateBatch.errors.join('\n'), /Duplicate item id/)
})

test('Issue 06: Student Suggestion defensively rejects array input', () => {
  const repository = loadTestRepositoryData()
  const course = repository.courses[0]

  const arraySuggestion = prepareSuggestion({
    repository,
    course,
    section: 'materials',
    intent: 'add-material',
    input: { items: [{ title: 'Batch Material 1' }, { title: 'Batch Material 2' }] },
  })

  assert.equal(arraySuggestion.valid, false)
  assert.match(arraySuggestion.errors.join('\n'), /Student Suggestions only support single items/)
})
