import { z } from "zod";

export const eventTypeSchema = z.enum(["EXAM", "LECTURE", "ASSIGNMENT"]);
export const eventLocationSchema = z.enum(["IN_PERSON", "ONLINE", "HYBRID"]);

export const eventFormSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, "Event title is required")
      .max(120, "Title must be 120 characters or less"),
    description: z
      .string()
      .max(2000, "Description must be 2000 characters or less")
      .optional()
      .or(z.literal("")),
    type: eventTypeSchema,
    startTime: z.string().min(1, "Start time is required"),
    endTime: z.string().optional().or(z.literal("")),
    durationMinutes: z.union([
      z.number().positive("Duration must be greater than 0"),
      z.literal(""),
      z.undefined(),
    ]),
    location: eventLocationSchema,
    locationDetails: z
      .string()
      .max(255, "Location details must be 255 characters or less")
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
    }

    // 3. If endTime is provided, validate it's after startTime
    if (data.endTime && data.endTime.trim() !== "" && data.startTime) {
      const startD = new Date(data.startTime);
      const endD = new Date(data.endTime);
      if (isNaN(endD.getTime())) {
        ctx.addIssue({
          code: "custom",
          path: ["endTime"],
          message: "Please enter a valid end date and time",
        });
      } else if (endD.getTime() <= startD.getTime()) {
        ctx.addIssue({
          code: "custom",
          path: ["endTime"],
          message: "End time must be after start time",
        });
      }
    }
  });

export type EventFormData = z.infer<typeof eventFormSchema>;
