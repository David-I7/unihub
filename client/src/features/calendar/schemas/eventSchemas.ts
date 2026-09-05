import { z } from "zod";

export const eventTypeSchema = z.enum(["EXAM", "LECTURE", "ASSIGNMENT"]);
export const eventLocationSchema = z.enum(["IN_PERSON", "ONLINE", "HYBRID"]);

export const eventFormSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, "Event title is required")
      .max(100, "Title must be 100 characters or less"),
    description: z
      .string()
      .max(500, "Description must be 500 characters or less")
      .optional()
      .or(z.literal("")),
    type: eventTypeSchema,
    startTime: z.string().min(1, "Start time is required"),
    durationHours: z.union([
      z
        .number()
        .positive("Duration must be greater than 0")
        .max(168, "Duration cannot exceed 168 hours"),
      z.literal(""),
      z.undefined(),
    ]),
    location: eventLocationSchema,
    locationDetails: z
      .string()
      .max(500, "Location details must be 500 characters or less")
      .optional()
      .or(z.literal("")),
    communitySlug: z.string().optional().or(z.literal("")),
    studyYear: z.string().optional().or(z.literal("")),
    courseId: z.union([z.number(), z.literal(""), z.undefined()]),
    isEditing: z.boolean().optional(),
  })
  .superRefine((data, ctx) => {
    // 1. If creating a new event, community and course are strictly required
    if (!data.isEditing) {
      if (!data.communitySlug || data.communitySlug.trim() === "") {
        ctx.addIssue({
          code: "custom",
          path: ["communitySlug"],
          message: "Please select a community",
        });
      }

      if (typeof data.courseId !== "number" || data.courseId <= 0) {
        ctx.addIssue({
          code: "custom",
          path: ["courseId"],
          message: "Please select a course for this event",
        });
      }
    }

    // 2. Validate start time format
    if (data.startTime) {
      const startD = new Date(data.startTime);
      if (isNaN(startD.getTime())) {
        ctx.addIssue({
          code: "custom",
          path: ["startTime"],
          message: "Please enter a valid start date and time",
        });
      }

      if (startD.getTime() < Date.now()) {
        ctx.addIssue({
          code: "custom",
          path: ["startTime"],
          message: "Start time cannot be in the past",
        });
      }
    }
  });

export type EventFormData = z.infer<typeof eventFormSchema>;
