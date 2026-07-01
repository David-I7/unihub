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
} from "./types.js";
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
} from "./coursePath.js";
export {
  deriveCourseDetailView,
  type CourseDetailView,
} from "./courseDetailView.js";
export {
  applyContribution,
  contributionPayloadFromText,
  prepareGeneratedContribution,
  prepareContribution,
  validateContribution,
  type GeneratedContributionDraft,
  type GithubTarget,
  type PreparedContribution,
} from "./contribution.js";
export {
  prepareSuggestion,
  suggestionHandoffCopy,
  suggestionIntentsForSection,
  type PreparedSuggestion,
  type SuggestionIntentOption,
  type SuggestionIntent,
  type SuggestionSection,
} from "./suggestion.js";
export {
  loadCatalog,
  loadRepositoryData,
  loadCoursesForContext,
} from "./repository.js";
export {
  repositorySchema,
  validateCatalog,
  validateCourse,
  validateRepository,
  validateContributionPayload,
} from "./validation.js";

import { courseInContext } from "./coursePath.js";
import type {
  Catalog,
  CourseContext,
  Hierarchy,
  LoadedCourse,
} from "./types.js";

export function buildHierarchy(
  catalog: Catalog,
  courses: LoadedCourse[],
): Hierarchy {
  const sortedCourses = [...courses].sort((a, b) =>
    a.title.localeCompare(b.title),
  );
  return {
    academicYears: [...catalog.academicYears]
      .sort(byOrder)
      .map((academicYear) => ({
        id: academicYear.id,
        label: academicYear.label,
        studyYears: [...academicYear.studyYears]
          .sort(byOrder)
          .map((studyYear) => ({
            id: studyYear.id,
            label: studyYear.label,
            semesters: [...studyYear.semesters]
              .sort(byOrder)
              .map((semester) => ({
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
  };
}

export function deriveActivity(
  courses: LoadedCourse[],
  context: CourseContext,
) {
  return courses
    .filter((course) => courseInContext(course, context))
    .flatMap((course) => [
      ...course.materials.filter(hasAddedAt).map((item) => ({
        id: `${course.id}-${item.id}`,
        type: "material" as const,
        action: "added" as const,
        occurredAt: item.addedAt,
        title: item.title,
        courseTitle: course.title,
      })),
      ...course.materials.filter(hasChangedAt).map((item) => ({
        id: `${course.id}-${item.id}-updated`,
        type: "material" as const,
        action: "updated" as const,
        occurredAt: item.updatedAt,
        title: item.title,
        courseTitle: course.title,
      })),
      ...course.assignmentDeadlines.filter(hasAddedAt).map((item) => ({
        id: `${course.id}-${item.id}`,
        type: "assignment" as const,
        action: "added" as const,
        occurredAt: item.addedAt,
        title: item.title,
        courseTitle: course.title,
      })),
      ...course.courseSessions.filter(hasAddedAt).map((item) => ({
        id: `${course.id}-${item.id}`,
        type: "lecture" as const,
        action: item.status === "cancelled" ? "cancelled" as const : "added" as const,
        occurredAt: item.addedAt,
        title: item.title,
        courseTitle: course.title,
      })),
      ...course.exams.filter(hasAddedAt).map((item) => ({
        id: `${course.id}-${item.id}`,
        type: "exam" as const,
        action: "added" as const,
        occurredAt: item.addedAt,
        title: item.title,
        courseTitle: course.title,
      })),
    ])
    .sort((a, b) => Date.parse(b.occurredAt) - Date.parse(a.occurredAt));
}

export function deriveCalendarEvents(options: {
  courses: LoadedCourse[];
  context: CourseContext;
  courseId?: string;
  eventType?: "assignment" | "exam" | "lecture" | "all";
  timeRange?: "upcoming" | "all";
  now?: Date;
}) {
  const nowTime = (options.now ?? new Date()).getTime();
  return options.courses
    .filter((course) => courseInContext(course, options.context))
    .filter((course) => !options.courseId || course.id === options.courseId)
    .flatMap((course) => [
      ...course.assignmentDeadlines.map((item) => ({
        id: `${course.id}-${item.id}`,
        type: "assignment" as const,
        title: item.title,
        courseTitle: course.title,
        startsAt: item.dueAt,
        status: Date.parse(item.dueAt) < nowTime ? "completed assignment" : "due assignment",
      })),
      ...course.courseSessions.map((item) => ({
        id: `${course.id}-${item.id}`,
        type: "lecture" as const,
        title: item.title,
        courseTitle: course.title,
        startsAt: item.startsAt,
        status:
          item.status === "cancelled"
            ? "cancelled lecture"
            : Date.parse(item.endsAt) < nowTime
              ? "completed lecture"
              : "scheduled lecture",
      })),
      ...course.exams
        .filter((item) => item.startsAt)
        .map((item) => ({
          id: `${course.id}-${item.id}`,
          type: "exam" as const,
          title: item.title,
          courseTitle: course.title,
          startsAt: item.startsAt as string,
          status: Date.parse(item.startsAt as string) < nowTime ? "completed exam" : "exam",
        })),
    ])
    .filter(
      (event) =>
        options.eventType === undefined ||
        options.eventType === "all" ||
        event.type === options.eventType,
    )
    .filter(
      (event) =>
        options.timeRange === "all" || Date.parse(event.startsAt) >= nowTime,
    )
    .sort((a, b) => compareCalendarEventsByProximity(a.startsAt, b.startsAt, nowTime));
}

function compareCalendarEventsByProximity(aStartsAt: string, bStartsAt: string, nowTime: number) {
  const aTime = Date.parse(aStartsAt);
  const bTime = Date.parse(bStartsAt);
  const aFuture = aTime >= nowTime;
  const bFuture = bTime >= nowTime;
  if (aFuture && bFuture) return aTime - bTime;
  if (!aFuture && !bFuture) return bTime - aTime;
  return aFuture ? -1 : 1;
}

function hasAddedAt<T extends { addedAt?: string }>(
  item: T,
): item is T & { addedAt: string } {
  return typeof item.addedAt === "string";
}

function hasChangedAt<T extends { addedAt?: string; updatedAt?: string }>(
  item: T,
): item is T & { addedAt: string; updatedAt: string } {
  return typeof item.addedAt === "string" && typeof item.updatedAt === "string" && item.updatedAt !== item.addedAt;
}

function byOrder(a: { order: number }, b: { order: number }) {
  return a.order - b.order;
}
