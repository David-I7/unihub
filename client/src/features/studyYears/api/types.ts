import { type CourseIndentifiers, type CourseCard } from "@/features/courses";
import { type PaginatedResponse } from "@/api/types";

export type StudyYearNameEnum = "YEAR_1" | "YEAR_2" | "YEAR_3" | "YEAR_4";
export type StudyYearSlug = "year-1" | "year-2" | "year-3" | "year-4";

export const STUDY_YEAR_OPTIONS = [
  { value: "year-1" as const, label: "Year 1", slug: "year-1" as const, yearNumber: 1 },
  { value: "year-2" as const, label: "Year 2", slug: "year-2" as const, yearNumber: 2 },
  { value: "year-3" as const, label: "Year 3", slug: "year-3" as const, yearNumber: 3 },
  { value: "year-4" as const, label: "Year 4", slug: "year-4" as const, yearNumber: 4 },
] as const;

export function formatStudyYearName(name: string): string {
  if (!name) return "";
  const clean = name.toLowerCase().replace(/[\s_]+/g, "-");
  if (clean === "year-1") return "Year 1";
  if (clean === "year-2") return "Year 2";
  if (clean === "year-3") return "Year 3";
  if (clean === "year-4") return "Year 4";
  return name;
}

export function studyYearNameToSlug(name: string): StudyYearSlug {
  if (!name) return "year-1";
  const clean = name.toLowerCase().replace(/[\s_]+/g, "-");
  if (clean === "year-1") return "year-1";
  if (clean === "year-2") return "year-2";
  if (clean === "year-3") return "year-3";
  if (clean === "year-4") return "year-4";
  return "year-1";
}

export function slugToStudyYearEnum(slug: string): StudyYearNameEnum {
  if (!slug) return "YEAR_1";
  const clean = slug.toLowerCase().replace(/[\s_]+/g, "-");
  if (clean === "year-1") return "YEAR_1";
  if (clean === "year-2") return "YEAR_2";
  if (clean === "year-3") return "YEAR_3";
  if (clean === "year-4") return "YEAR_4";
  return "YEAR_1";
}

export const StudyYearNameMap = {
  "Year 1": "year-1" as const,
  "Year 2": "year-2" as const,
  "Year 3": "year-3" as const,
  "Year 4": "year-4" as const,
  "YEAR_1": "year-1" as const,
  "YEAR_2": "year-2" as const,
  "YEAR_3": "year-3" as const,
  "YEAR_4": "year-4" as const,
};

export type StudyYearNameDto =
  (typeof StudyYearNameMap)[keyof typeof StudyYearNameMap];

export type StudyYearName = StudyYearNameEnum | keyof typeof StudyYearNameMap;

export type StudyYearMetrics = {
  coursesCount: number;
  activeCoursesCount?: number;
  archivedCoursesCount: number;
  creditsCount: number;
} & StudyYear;

export type StudyYear = {
  id: number;
  studyYearName: StudyYearName;
  name?: StudyYearName;
  createdAt: string;
};

export type StudyYearIdentifiers = {
  id: number;
  studyYearName: StudyYearName;
};

export interface StudyYearHome {
  studyYear: StudyYear;
  courses: PaginatedResponse<CourseCard>;
}

export type StudyYearDetail = StudyYearHome;

export type StudyYearCourses = CourseIndentifiers[];
