export type {
  AssignmentDeadline,
  Catalog,
  ContributionDraft,
  ContributionType,
  Course,
  CourseContext,
  CoursePath,
  CourseSession,
  Exam,
  Hierarchy,
  LoadedCourse,
  Material,
  MaterialType,
  RepositorySnapshot,
  SessionStatus,
  ValidationResult,
} from './types.js'
export {
  courseDataFilePath,
  coursePathFromRepositoryPath,
  coursePathFromRouteParams,
  courseRepositoryPath,
  courseRoute,
  courseRoutePath,
  findCourse,
  parseCourseRoute,
  selectedContextCourses,
} from './coursePath.js'
export { deriveCourseDetailView, type CourseDetailView } from './courseDetailView.js'
export { applyContribution, contributionPayloadFromText, prepareContribution, validateContribution, type GithubTarget, type PreparedContribution } from './contribution.js'
export { loadRepositoryData, loadCoursesForContext } from './repository.js'
export { repositorySchema, validateCatalog, validateCourse, validateRepository, validateContributionPayload } from './validation.js'

import { courseInContext } from './coursePath.js'
import type { Catalog, CourseContext, Hierarchy, LoadedCourse } from './types.js'

export function buildHierarchy(catalog: Catalog, courses: LoadedCourse[]): Hierarchy {
  const sortedCourses = [...courses].sort((a, b) => a.title.localeCompare(b.title))
  return {
    academicYears: [...catalog.academicYears]
      .sort(byOrder)
      .map((academicYear) => ({
        id: academicYear.id,
        label: academicYear.label,
        studyYears: [...academicYear.studyYears].sort(byOrder).map((studyYear) => ({
          id: studyYear.id,
          label: studyYear.label,
          semesters: [...studyYear.semesters].sort(byOrder).map((semester) => ({
            id: semester.id,
            label: semester.label,
            courses: sortedCourses.filter(
              (course) =>
                course.path.academicYearId === academicYear.id &&
                course.path.studyYearId === studyYear.id &&
                course.path.semesterId === semester.id,
            ),
          })),
        })),
      })),
  }
}

export function deriveActivity(courses: LoadedCourse[], context: CourseContext) {
  return courses
    .filter((course) => courseInContext(course, context))
    .flatMap((course) => [
      ...course.materials.filter(hasAddedAt).map((item) => ({
        id: `${course.id}-${item.id}`,
        addedAt: item.addedAt,
        text: `${item.title} Material added for ${course.title}`,
      })),
      ...course.assignmentDeadlines.filter(hasAddedAt).map((item) => ({
        id: `${course.id}-${item.id}`,
        addedAt: item.addedAt,
        text: `${item.title} Assignment Deadline added for ${course.title}`,
      })),
      ...course.courseSessions.filter(hasAddedAt).map((item) => ({
        id: `${course.id}-${item.id}`,
        addedAt: item.addedAt,
        text: `${item.title} Lecture added for ${course.title}${item.status === 'cancelled' ? ' (cancelled)' : ''}`,
      })),
      ...course.exams.filter(hasAddedAt).map((item) => ({
        id: `${course.id}-${item.id}`,
        addedAt: item.addedAt,
        text: `${item.title} Exam added for ${course.title}`,
      })),
    ])
    .sort((a, b) => Date.parse(b.addedAt) - Date.parse(a.addedAt))
}

export function deriveCalendarEvents(options: {
  courses: LoadedCourse[]
  context: CourseContext
  courseId?: string
  eventType?: 'assignment' | 'exam' | 'lecture' | 'all'
  timeRange?: 'upcoming' | 'all'
  now?: Date
}) {
  const nowTime = (options.now ?? new Date()).getTime()
  return options.courses
    .filter((course) => courseInContext(course, options.context))
    .filter((course) => !options.courseId || course.id === options.courseId)
    .flatMap((course) => [
      ...course.assignmentDeadlines.map((item) => ({
        id: `${course.id}-${item.id}`,
        type: 'assignment' as const,
        title: item.title,
        courseTitle: course.title,
        startsAt: item.dueAt,
        status: 'due assignment',
      })),
      ...course.courseSessions.map((item) => ({
        id: `${course.id}-${item.id}`,
        type: 'lecture' as const,
        title: item.title,
        courseTitle: course.title,
        startsAt: item.startsAt,
        status: item.status === 'cancelled' ? 'cancelled lecture' : 'scheduled lecture',
      })),
      ...course.exams.filter((item) => item.startsAt).map((item) => ({
        id: `${course.id}-${item.id}`,
        type: 'exam' as const,
        title: item.title,
        courseTitle: course.title,
        startsAt: item.startsAt as string,
        status: 'exam',
      })),
    ])
    .filter((event) => options.eventType === undefined || options.eventType === 'all' || event.type === options.eventType)
    .filter((event) => options.timeRange === 'all' || Date.parse(event.startsAt) >= nowTime)
    .sort((a, b) => Date.parse(a.startsAt) - Date.parse(b.startsAt))
}

function hasAddedAt<T extends { addedAt?: string }>(item: T): item is T & { addedAt: string } {
  return typeof item.addedAt === 'string'
}

function byOrder(a: { order: number }, b: { order: number }) {
  return a.order - b.order
}
