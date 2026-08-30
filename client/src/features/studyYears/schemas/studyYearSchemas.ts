import { z } from "zod";

export const createStudyYearSchema = z.object({
  studyYearName: z.enum(["YEAR_1", "YEAR_2", "YEAR_3", "YEAR_4"], {
    message: "Please select a valid study year (Year 1 - Year 4)",
  }),
});

export type CreateStudyYearFormData = z.infer<typeof createStudyYearSchema>;
