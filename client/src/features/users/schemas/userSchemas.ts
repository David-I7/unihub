import { z } from "zod";
import { usernameSchema } from "@/features/auth/schemas/authSchemas";

export const updateUsernameSchema = z.object({
  username: usernameSchema,
});

export type UpdateUsernameFormData = z.infer<typeof updateUsernameSchema>;
