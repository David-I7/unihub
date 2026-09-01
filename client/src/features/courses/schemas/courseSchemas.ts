import { z } from "zod";

export const createCourseSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name cannot exceed 100 characters"),
  slug: z
    .string()
    .trim()
    .min(2, "Slug must be at least 2 characters")
    .max(100, "Slug cannot exceed 100 characters")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug must contain only lowercase alphanumeric characters and hyphens",
    ),
  abbreviation: z
    .string()
    .trim()
    .min(2, "Abbreviation must be between 2 and 4 characters")
    .max(4, "Abbreviation must be between 2 and 4 characters"),
  semester: z
    .number()
    .int()
    .min(1, "Semester must be 1 or 2")
    .max(2, "Semester must be 1 or 2"),
  creditPoints: z
    .number()
    .int()
    .min(1, "Credits must be between 1 and 6")
    .max(6, "Credits must be between 1 and 6")
    .default(5),
  description: z
    .string()
    .trim()
    .max(1000, "Description cannot exceed 1000 characters")
    .optional()
    .or(z.literal("")),
  readme: z
    .string()
    .trim()
    .max(50000, "Readme cannot exceed 50000 characters")
    .optional()
    .or(z.literal("")),
  teacherIds: z.array(z.string()).optional(),
});

export type CreateCourseSchemaValues = z.infer<typeof createCourseSchema>;

export const updateCourseSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name cannot exceed 100 characters")
    .optional(),
  slug: z
    .string()
    .trim()
    .min(2, "Slug must be at least 2 characters")
    .max(100, "Slug cannot exceed 100 characters")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug must contain only lowercase alphanumeric characters and hyphens",
    )
    .optional(),
  abbreviation: z
    .string()
    .trim()
    .min(2, "Abbreviation must be between 2 and 4 characters")
    .max(4, "Abbreviation must be between 2 and 4 characters")
    .optional(),
  semester: z
    .number()
    .int()
    .min(1, "Semester must be 1 or 2")
    .max(2, "Semester must be 1 or 2")
    .optional(),
  creditPoints: z
    .number()
    .int()
    .min(1, "Credits must be between 1 and 6")
    .max(6, "Credits must be between 1 and 6")
    .optional(),
  description: z
    .string()
    .trim()
    .max(1000, "Description cannot exceed 1000 characters")
    .optional()
    .or(z.literal("")),
  readme: z
    .string()
    .trim()
    .max(50000, "Readme cannot exceed 50000 characters")
    .optional()
    .or(z.literal("")),
  archived: z.boolean().optional(),
  teacherIds: z.array(z.string()).optional(),
});

export type UpdateCourseSchemaValues = z.infer<typeof updateCourseSchema>;

export const editCourseReadmeSchema = z.object({
  readme: z.string().max(50000, "Readme cannot exceed 50000 characters"),
});

export type EditCourseReadmeSchemaValues = z.infer<typeof editCourseReadmeSchema>;
