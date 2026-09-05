import { z } from "zod";

export const createCommunitySchema = z.object({
  name: z
    .string()
    .min(2, "Community name must be at least 2 characters")
    .max(100, "Community name must not exceed 100 characters"),
  slug: z
    .string()
    .min(2, "Slug must be at least 2 characters")
    .max(50, "Slug must not exceed 50 characters")
    .regex(
      /^[a-z0-9-]+$/,
      "Slug can only contain lowercase letters, numbers, and hyphens",
    ),
  description: z
    .string()
    .min(1, "Description is required")
    .max(500, "Description must not exceed 500 characters"),
  backgroundColor: z
    .string()
    .regex(/^#([A-Fa-f0-9]{6})$/, "Must be a valid 6-character hex color (e.g. #3b82f6)"),
});

export type CreateCommunityFormData = z.infer<typeof createCommunitySchema>;

export const updateCommunitySchema = z.object({
  name: z
    .string()
    .min(2, "Community name must be at least 2 characters")
    .max(100, "Community name must not exceed 100 characters")
    .optional(),
  slug: z
    .string()
    .min(2, "Slug must be at least 2 characters")
    .max(50, "Slug must not exceed 50 characters")
    .regex(
      /^[a-z0-9-]+$/,
      "Slug can only contain lowercase letters, numbers, and hyphens",
    )
    .optional(),
  description: z
    .string()
    .max(500, "Description must not exceed 500 characters")
    .optional(),
  readme: z
    .string()
    .max(50000, "Readme markdown must not exceed 50,000 characters")
    .optional(),
  backgroundColor: z
    .string()
    .regex(/^#([A-Fa-f0-9]{6})$/, "Must be a valid 6-character hex color")
    .optional(),
  verified: z.boolean().optional(),
  newOwnerUsername: z.string().optional(),
});

export type UpdateCommunityFormData = z.infer<typeof updateCommunitySchema>;

export const joinCommunitySchema = z.object({
  joinCode: z
    .string()
    .length(8, "Join code must be exactly 8 characters")
    .toUpperCase(),
});

export type JoinCommunityFormData = z.infer<typeof joinCommunitySchema>;

export const createJoinCodeSchema = z.object({
  maxUses: z.number().int().min(1).nullable().optional(),
  validForHours: z.number().int().min(1).nullable().optional(),
});

export type CreateJoinCodeFormData = z.infer<typeof createJoinCodeSchema>;

export const updateJoinCodeSchema = z.object({
  maxUses: z.number().int().min(-1).nullable().optional(),
  validForHours: z.number().int().min(-1).nullable().optional(),
});

export type UpdateJoinCodeFormData = z.infer<typeof updateJoinCodeSchema>;
