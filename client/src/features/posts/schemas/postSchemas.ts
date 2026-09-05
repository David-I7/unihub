import { z } from "zod";

export const createPostSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(100, "Title must not exceed 100 characters"),
  description: z
    .string()
    .min(5, "Description must be at least 5 characters")
    .max(10000, "Description must not exceed 10,000 characters"),
});

export type CreatePostFormData = z.infer<typeof createPostSchema>;

export const updatePostSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(100, "Title must not exceed 100 characters")
    .optional(),
  description: z
    .string()
    .min(5, "Description must be at least 5 characters")
    .max(20000, "Description must not exceed 20,000 characters")
    .optional(),
});

export type UpdatePostFormData = z.infer<typeof updatePostSchema>;

export const pinPostSchema = z.object({
  pinned: z.boolean(),
});

export type PinPostFormData = z.infer<typeof pinPostSchema>;
