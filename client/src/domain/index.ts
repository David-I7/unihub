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
  deriveActivity,
  deriveCalendarEvents,
} from "./timeline.js";
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

import type {
  Catalog,
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

function byOrder(a: { order: number }, b: { order: number }) {
  return a.order - b.order;
}
