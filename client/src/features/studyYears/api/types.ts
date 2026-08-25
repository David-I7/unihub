export const StudyYearNameMap = {
  "Year 1": "YEAR_1" as const,
  "Year 2": "YEAR_2" as const,
  "Year 3": "YEAR_3" as const,
  "Year 4": "YEAR_4" as const,
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
