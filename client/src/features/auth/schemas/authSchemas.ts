import { z } from "zod";

export const emailSchema = z.email("Please enter a valid email address");

export const usernameSchema = z
  .string()
  .min(3, "Username must be at least 3 characters long.")
  .regex(
    /^[a-zA-Z0-9_-]+$/,
    "Username can only contain letters, numbers, underscores (_), and hyphens (-)."
  )
  .regex(
    /^[a-zA-Z0-9].*[a-zA-Z0-9]$/,
    "Username must start and end with a letter or a number."
  );

export const identifierSchema = z.string().superRefine((val, ctx) => {
  if (val.length === 0) {
    ctx.addIssue({
      code: "custom",
      message: "Email or username is required",
    });
    return;
  }

  if (val.includes("@")) {
    const result = emailSchema.safeParse(val);
    if (!result.success) {
      ctx.addIssue({
        code: "custom",
        message: result.error.issues[0]?.message || "Please enter a valid email address",
      });
    }
  } else {
    const result = usernameSchema.safeParse(val);
    if (!result.success) {
      ctx.addIssue({
        code: "custom",
        message: result.error.issues[0]?.message || "Invalid username format",
      });
    }
  }
});

export const loginSchema = z.object({
  identifier: identifierSchema,
  password: z.string().min(1, "Password is required"),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  email: emailSchema,
  username: usernameSchema,
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export type RegisterFormData = z.infer<typeof registerSchema>;
