export const StudyYearNameMap = {
  "Year 1": "year-1" as const,
  "Year 2": "year-2" as const,
  "Year 3": "year-3" as const,
  "Year 4": "year-4" as const,
};

export type StudyYearNameDto =
  (typeof StudyYearNameMap)[keyof typeof StudyYearNameMap];

export type StudyYearName = keyof typeof StudyYearNameMap;

export interface StudyYearSummary {
  id: number;
  studyYearName: StudyYearName;
  coursesCount: number;
  creditsCount: number;
}
