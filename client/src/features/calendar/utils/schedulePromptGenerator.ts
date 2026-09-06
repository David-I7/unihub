export interface PromptCourseItem {
  id: number;
  name: string;
  abbreviation?: string;
}

export interface GeneratePromptParams {
  communityName: string;
  studyYearDisplayName: string; // e.g. "Anul I" or "Year 1"
  courses: PromptCourseItem[];
}

export function generateSchedulePrompt({
  communityName,
  studyYearDisplayName,
  courses,
}: GeneratePromptParams): string {
  const courseCatalogText =
    courses.length > 0
      ? courses
          .map(
            (c) =>
              `- [ID: ${c.id}] ${c.name}${c.abbreviation ? ` (${c.abbreviation})` : ""}`,
          )
          .join("\n")
      : "No courses listed yet. You can look up course IDs manually in UniHub.";

  return `You are a data extraction assistant for UniHub.
Your task is to analyze the attached university schedule / exam timetable document (or pasted text) and convert the events for the target study year into a structured JSON array.

Target community: "${communityName}"
Target cohort: "${studyYearDisplayName}"

CRITICAL SAFEGUARD:
Focus exclusively on tables, pages, and rows belonging to "${studyYearDisplayName}".
Completely ignore any sections, pages, or headers for other study years (for example, if targeting Anul I, ignore Anul II and Anul III).

VALID COURSE CATALOG FOR THIS COHORT:
Match each subject in the document to the corresponding course ID from this list:
${courseCatalogText}

Only use course IDs from the list above. Do not invent new course IDs.

EVENT EXTRACTION & CONVENTIONAL NAMING RULES:
1. Supported Types:
   - Only "LECTURE" and "EXAM" types are supported. Do not output assignments or any other type.
2. Title Conventions:
   - If the document or section is for exams ("examene", "sesiune examene"):
     * type: "EXAM"
     * title: "Examen - [Disciplina]" (e.g. "Examen - Baze de date")
   - If the document or section is for retakes or re-examinations ("restante", "reexaminari", "mariri de note"). Include the specific reexamination type in the title (e.g. "Reexaminare - [Disciplina]" or "Marire de nota - [Disciplina]" or "Reexaminare si Mariri de Note - [Disciplina]").:
     * type: "EXAM"
     * title: "Reexaminare - [Disciplina]" (e.g. "Reexaminare - Baze de date")
   - If the document or section is for lectures/classes ("cursuri", "orar", "programare cursuri"):
     * type: "LECTURE"
     * title: "Curs - [Disciplina]" (e.g. "Curs - Geometrie și algebră liniară")
     * If there are distinct groups (Grupa 1, Grupa 2) with different times, append the group: "Curs - [Disciplina] (Grupa 1)".
3. Location & Room Rules:
   - locationDetails: MUST contain ONLY the room or amphitheater name (e.g. "Sala 111", "Amfiteatrul 701", "Sala 102").
     CRITICAL: NEVER put teacher names or course notes into locationDetails. If no room is specified or it is Online, set locationDetails to null.
   - location:
     * "ONLINE" if marked as Online.
     * "IN_PERSON" if a physical room or amphitheater is specified.
     * "HYBRID" if marked as Hibrid.
4. Teachers & Description:
   - Put teacher information into the description field (e.g. "Cadru didactic: Asist univ. dr. Halanay Andrei").
5. Date, Time & Duration:
   - In course schedules, a single table cell may list multiple sessions on different dates. Extract EACH date/time line as an INDEPENDENT event object in the array.
   - If only a start hour is given (common for exams, e.g. "Ora 10.00"), set durationHours to 2.0.
   - If an hour range is given (common for lectures, e.g. "10.00 - 15.00" or "17:00 - 19:00"), calculate the exact duration in hours (e.g. 5.0 or 2.0).
   - Format startTime as ISO 8601 with Romania's timezone offset (+02:00 for winter or +03:00 for daylight saving time).
     Example: "2026-09-09T10:00:00+03:00"
   - Correct obvious document typos (for instance, if the header specifies academic year 2025-2026 Semester II, years listed as "2025" or "202" are typos for "2026").
   - Do not output events with start times in the past relative to today.
6. Empty or Cancelled Entries:
   - If a course row has a dash ("-") or no scheduled dates (e.g. Educație fizică), omit it.
   - If a course has not been provided to you, but it exists in the document, omit it. Do not invent new course IDs or titles.

OUTPUT FORMAT:
Output ONLY a valid JSON array of objects. Do not include markdown code blocks, backticks, or any explanatory text.

JSON Schema for each object:
{
  "courseId": number,
  "title": string,
  "description": string | null,
  "type": "LECTURE" | "EXAM",
  "startTime": string,
  "durationHours": number,
  "location": "ONLINE" | "IN_PERSON" | "HYBRID",
  "locationDetails": string | null
}
`;
}
