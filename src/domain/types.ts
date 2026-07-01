export type MaterialType =
  | "course"
  | "seminar"
  | "lab"
  | "assignment"
  | "exam"
  | "video"
  | "other";
export type SessionStatus = "scheduled" | "cancelled";
export type ContributionType =
  | "add-material"
  | "update-material"
  | "add-assignment-deadline"
  | "add-exam"
  | "add-course-session"
  | "edit-course-metadata"
  | "add-new-course"
  | "add-academic-year"
  | "add-study-year"
  | "add-semester";

export type CoursePath = {
  academicYearId: string;
  studyYearId: string;
  semesterId: string;
  courseId: string;
};

export type CourseContext = Omit<CoursePath, "courseId">;

export type Catalog = {
  academicYears: Array<{
    id: string;
    label: string;
    order: number;
    studyYears: Array<{
      id: string;
      label: string;
      order: number;
      semesters: Array<{ id: string; label: string; order: number }>;
    }>;
  }>;
};

export type Material = {
  id: string;
  type: MaterialType;
  title: string;
  url: string;
  addedAt: string;
  updatedAt: string;
};

export type AssignmentDeadline = {
  id: string;
  title: string;
  description?: string;
  dueAt: string;
  submissionUrl?: string;
  gradeWeight?: number;
  materialIds?: string[];
  addedAt: string;
  updatedAt: string;
};

export type CourseSession = {
  id: string;
  title: string;
  startsAt: string;
  endsAt: string;
  location?: string;
  status: SessionStatus;
  addedAt: string;
  updatedAt: string;
};

export type Exam = {
  id: string;
  title: string;
  startsAt?: string;
  gradeWeight?: number;
  materialIds?: string[];
  addedAt: string;
  updatedAt: string;
};

export type Course = {
  id: string;
  title: string;
  professors: string[];
  description?: string;
  materials: Material[];
  assignmentDeadlines: AssignmentDeadline[];
  courseSessions: CourseSession[];
  exams: Exam[];
};

export type LoadedCourse = Course & { path: CoursePath };

export type ValidationResult = {
  valid: boolean;
  errors: string[];
  warnings: string[];
};

export type Hierarchy = {
  academicYears: Array<{
    id: string;
    label: string;
    studyYears: Array<{
      id: string;
      label: string;
      semesters: Array<{
        id: string;
        label: string;
        courses: LoadedCourse[];
      }>;
    }>;
  }>;
};

export type RepositorySnapshot = {
  catalog: Catalog;
  courses: LoadedCourse[];
};

export type ContributionDraft = {
  type: ContributionType;
  mode: "issue" | "pull-request";
  path: CoursePath;
  payloadText: string;
};
