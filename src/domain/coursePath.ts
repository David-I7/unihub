import type { CourseContext, CoursePath, LoadedCourse } from './types.js'
import { hasString, isRecord } from './records.js'

const courseRoutePattern = /^#?\/courses\/([^/]+)\/([^/]+)\/([^/]+)\/([^/]+)$/
const repositoryCoursePattern = /(?:^|\/)courses\/([^/]+)\/([^/]+)\/([^/]+)\/([^/.]+)\.json$/

export function coursePathFromRepositoryPath(path: string): CoursePath {
  const normalized = path.replace(/\\/g, '/')
  const match = normalized.match(repositoryCoursePattern)
  if (!match) throw new Error(`Invalid Course Path file location: ${path}`)
  return {
    academicYearId: match[1],
    studyYearId: match[2],
    semesterId: match[3],
    courseId: match[4],
  }
}

export function courseRepositoryPath(path: CoursePath): string {
  return `${path.academicYearId}/${path.studyYearId}/${path.semesterId}/${path.courseId}`
}

export function courseDataFilePath(path: CoursePath): string {
  return `public/data/courses/${courseRepositoryPath(path)}.json`
}

export function courseRoute(path: CoursePath): string {
  return `#/courses/${courseRepositoryPath(path)}`
}

export function courseRoutePath(path: CoursePath): string {
  return courseRoute(path).replace('#', '')
}

export function parseCourseRoute(hash: string): CoursePath | undefined {
  const match = hash.match(courseRoutePattern)
  if (!match) return undefined
  return {
    academicYearId: match[1],
    studyYearId: match[2],
    semesterId: match[3],
    courseId: match[4],
  }
}

export function coursePathFromRouteParams(params: unknown): CoursePath | undefined {
  if (
    !isRecord(params) ||
    !hasString(params, 'academicYearId') ||
    !hasString(params, 'studyYearId') ||
    !hasString(params, 'semesterId') ||
    !hasString(params, 'courseId')
  ) {
    return undefined
  }
  return {
    academicYearId: params.academicYearId,
    studyYearId: params.studyYearId,
    semesterId: params.semesterId,
    courseId: params.courseId,
  }
}

export function courseMatchesPath(course: LoadedCourse, path: CoursePath): boolean {
  return (
    course.path.academicYearId === path.academicYearId &&
    course.path.studyYearId === path.studyYearId &&
    course.path.semesterId === path.semesterId &&
    course.id === path.courseId
  )
}

export function courseInContext(course: LoadedCourse, context: CourseContext): boolean {
  return (
    course.path.academicYearId === context.academicYearId &&
    course.path.studyYearId === context.studyYearId &&
    course.path.semesterId === context.semesterId
  )
}

export function findCourse(courses: LoadedCourse[], path: CoursePath): LoadedCourse | undefined {
  return courses.find((course) => courseMatchesPath(course, path))
}

export function selectedContextCourses(courses: LoadedCourse[], context: CourseContext): LoadedCourse[] {
  return courses.filter((course) => courseInContext(course, context))
}
